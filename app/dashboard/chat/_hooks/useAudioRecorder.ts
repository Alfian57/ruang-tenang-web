import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseAudioRecorderOptions {
  onRecordingComplete: (audioBlob: Blob) => Promise<void>;
}

export function useAudioRecorder({ onRecordingComplete }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    if (mediaRecorderRef.current?.state === "recording") return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Browser ini belum mendukung rekaman suara.");
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"]
        .find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) {
        stream.getTracks().forEach((track) => track.stop());
        toast.error("Format rekaman suara browser ini belum didukung.");
        return;
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const capturedStream = stream;
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        mediaRecorderRef.current = null;
        capturedStream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (audioBlob.size === 0) {
          toast.error("Rekaman kosong. Silakan coba lagi.");
          return;
        }
        setIsSending(true);
        try {
          await onRecordingComplete(audioBlob);
        } finally {
          setIsSending(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      console.error("useAudioRecorder: failed to access microphone", error);
      toast.error("Gagal mengakses mikrofon", {
        description: "Pastikan izin mikrofon telah diberikan di pengaturan browser."
      });
    }
  }, [onRecordingComplete]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state === "recording") mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isRecording,
    recordingDuration,
    isSending,
    startRecording,
    stopRecording,
    formatRecordingTime
  };
}
