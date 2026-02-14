import { useState, useCallback, useRef } from "react";

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  error: Error | null;
}

interface UseOptimisticOptions<T> {
  onError?: (error: Error, rollbackData: T) => void;
  onSuccess?: (data: T) => void;
}

/**
 * Hook for managing optimistic updates
 * Allows immediate UI updates with automatic rollback on failure
 */
export function useOptimistic<T>(
  initialData: T,
  options: UseOptimisticOptions<T> = {}
) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    error: null,
  });
  
  const rollbackDataRef = useRef<T>(initialData);

  const setOptimistic = useCallback(
    (newData: T | ((prev: T) => T)) => {
      setState((prev) => {
        const nextData = typeof newData === "function" 
          ? (newData as (prev: T) => T)(prev.data) 
          : newData;
        rollbackDataRef.current = prev.data;
        return {
          data: nextData,
          isOptimistic: true,
          error: null,
        };
      });
    },
    []
  );

  const confirm = useCallback(
    (confirmedData?: T) => {
      setState((prev) => ({
        data: confirmedData ?? prev.data,
        isOptimistic: false,
        error: null,
      }));
      if (confirmedData ?? state.data) {
        options.onSuccess?.(confirmedData ?? state.data);
      }
    },
    [options, state.data]
  );

  const rollback = useCallback(
    (error?: Error) => {
      const rollbackData = rollbackDataRef.current;
      setState({
        data: rollbackData,
        isOptimistic: false,
        error: error ?? null,
      });
      if (error) {
        options.onError?.(error, rollbackData);
      }
    },
    [options]
  );

  const reset = useCallback(
    (newData: T) => {
      rollbackDataRef.current = newData;
      setState({
        data: newData,
        isOptimistic: false,
        error: null,
      });
    },
    []
  );

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    error: state.error,
    setOptimistic,
    confirm,
    rollback,
    reset,
  };
}

/**
 * Hook specifically for optimistic like/unlike operations
 */
export function useOptimisticLike(
  initialLiked: boolean,
  initialCount: number,
  onLike: () => Promise<void>,
  onUnlike: () => Promise<void>
) {
  const [state, setState] = useState({
    isLiked: initialLiked,
    count: initialCount,
    isPending: false,
    error: null as Error | null,
  });

  const previousState = useRef({ isLiked: initialLiked, count: initialCount });

  const toggle = useCallback(async () => {
    // Save current state for rollback
    previousState.current = { isLiked: state.isLiked, count: state.count };

    // Optimistically update
    setState((prev) => ({
      isLiked: !prev.isLiked,
      count: prev.isLiked ? prev.count - 1 : prev.count + 1,
      isPending: true,
      error: null,
    }));

    try {
      if (state.isLiked) {
        await onUnlike();
      } else {
        await onLike();
      }
      setState((prev) => ({ ...prev, isPending: false }));
    } catch (error) {
      // Rollback on error
      setState({
        ...previousState.current,
        isPending: false,
        error: error instanceof Error ? error : new Error("Failed to update"),
      });
    }
  }, [state.isLiked, state.count, onLike, onUnlike]);

  const reset = useCallback((liked: boolean, count: number) => {
    previousState.current = { isLiked: liked, count };
    setState({
      isLiked: liked,
      count,
      isPending: false,
      error: null,
    });
  }, []);

  return {
    isLiked: state.isLiked,
    count: state.count,
    isPending: state.isPending,
    error: state.error,
    toggle,
    reset,
  };
}

/**
 * Hook for optimistic message sending
 */
export function useOptimisticMessages<T extends { id: string; status?: "sending" | "sent" | "error" }>(
  initialMessages: T[] = []
) {
  const [messages, setMessages] = useState<T[]>(initialMessages);
  const pendingMessages = useRef<Map<string, T>>(new Map());

  const addOptimisticMessage = useCallback((message: T) => {
    const optimisticMessage = { ...message, status: "sending" as const };
    pendingMessages.current.set(message.id, message);
    setMessages((prev) => [...prev, optimisticMessage]);
    return message.id;
  }, []);

  const confirmMessage = useCallback((id: string, confirmedMessage?: T) => {
    pendingMessages.current.delete(id);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...(confirmedMessage ?? msg), status: "sent" as const }
          : msg
      )
    );
  }, []);

  const failMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, status: "error" as const } : msg
      )
    );
  }, []);

  const removeMessage = useCallback((id: string) => {
    pendingMessages.current.delete(id);
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const retryMessage = useCallback(
    async (id: string, sendFn: (message: T) => Promise<T>) => {
      const message = pendingMessages.current.get(id);
      if (!message) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, status: "sending" as const } : msg
        )
      );

      try {
        const result = await sendFn(message);
        confirmMessage(id, result);
      } catch {
        failMessage(id);
      }
    },
    [confirmMessage, failMessage]
  );

  const reset = useCallback((newMessages: T[]) => {
    pendingMessages.current.clear();
    setMessages(newMessages);
  }, []);

  return {
    messages,
    addOptimisticMessage,
    confirmMessage,
    failMessage,
    removeMessage,
    retryMessage,
    reset,
    hasPending: pendingMessages.current.size > 0,
  };
}

/**
 * Hook for optimistic list operations (add, remove, update)
 */
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[] = []
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const pendingOperations = useRef<Map<string, { type: "add" | "remove" | "update"; original?: T }>>(new Map());

  const addOptimistic = useCallback((item: T) => {
    pendingOperations.current.set(item.id, { type: "add" });
    setItems((prev) => [...prev, item]);
  }, []);

  const removeOptimistic = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      pendingOperations.current.set(id, { type: "remove", original: item });
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }, [items]);

  const updateOptimistic = useCallback((id: string, updates: Partial<T>) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      pendingOperations.current.set(id, { type: "update", original: item });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
      );
    }
  }, [items]);

  const confirm = useCallback((id: string, confirmedItem?: T) => {
    pendingOperations.current.delete(id);
    if (confirmedItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? confirmedItem : i))
      );
    }
  }, []);

  const rollback = useCallback((id: string) => {
    const operation = pendingOperations.current.get(id);
    if (!operation) return;

    pendingOperations.current.delete(id);

    switch (operation.type) {
      case "add":
        setItems((prev) => prev.filter((i) => i.id !== id));
        break;
      case "remove":
        if (operation.original) {
          setItems((prev) => [...prev, operation.original!]);
        }
        break;
      case "update":
        if (operation.original) {
          setItems((prev) =>
            prev.map((i) => (i.id === id ? operation.original! : i))
          );
        }
        break;
    }
  }, []);

  const reset = useCallback((newItems: T[]) => {
    pendingOperations.current.clear();
    setItems(newItems);
  }, []);

  return {
    items,
    addOptimistic,
    removeOptimistic,
    updateOptimistic,
    confirm,
    rollback,
    reset,
    isPending: (id: string) => pendingOperations.current.has(id),
  };
}
