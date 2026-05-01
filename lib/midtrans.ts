export type MidtransEnvironment = "sandbox" | "production";

interface MidtransSnapPayCallbacks {
  onSuccess?: (result?: unknown) => void;
  onPending?: (result?: unknown) => void;
  onError?: (result?: unknown) => void;
  onClose?: () => void;
}

interface MidtransSnap {
  pay: (token: string, callbacks?: MidtransSnapPayCallbacks) => void;
}

declare global {
  interface Window {
    snap?: MidtransSnap;
    __midtransSnapLoadingPromise?: Promise<boolean>;
  }
}

function getSnapScriptUrl(environment: MidtransEnvironment): string {
  if (environment === "production") {
    return "https://app.midtrans.com/snap/snap.js";
  }

  return "https://app.sandbox.midtrans.com/snap/snap.js";
}

export async function loadMidtransSnapScript(
  clientKey: string,
  environment: MidtransEnvironment = "sandbox"
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.snap) return true;

  const trimmedClientKey = clientKey.trim();
  if (!trimmedClientKey) return false;

  if (window.__midtransSnapLoadingPromise) {
    return window.__midtransSnapLoadingPromise;
  }

  window.__midtransSnapLoadingPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = getSnapScriptUrl(environment);
    script.async = true;
    script.dataset.clientKey = trimmedClientKey;

    script.onload = () => resolve(Boolean(window.snap));
    script.onerror = () => resolve(false);

    document.head.appendChild(script);
  });

  return window.__midtransSnapLoadingPromise;
}

export async function openMidtransCheckout(params: {
  snapToken?: string;
  snapUrl?: string;
  clientKey: string;
  environment?: MidtransEnvironment;
  callbacks?: MidtransSnapPayCallbacks;
}): Promise<boolean> {
  const {
    snapToken,
    snapUrl,
    clientKey,
    environment = "sandbox",
    callbacks,
  } = params;

  const scriptReady = await loadMidtransSnapScript(clientKey, environment);
  if (scriptReady && snapToken && typeof window !== "undefined" && window.snap) {
    window.snap.pay(snapToken, callbacks);
    return true;
  }

  if (snapUrl && typeof window !== "undefined") {
    window.open(snapUrl, "_blank", "noopener,noreferrer");
    return true;
  }

  return false;
}
