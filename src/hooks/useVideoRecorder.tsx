import { useRef, useState } from "react";

type Mode = "preview" | "recording" | "review";

export function useVideoRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [mode, setMode] = useState<Mode>("preview");

  /* ================= CAMERA PREVIEW ================= */
  const initCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.controls = false;
      await videoRef.current.play();
    }

    setMode("preview");
  };

  /* ================= TIMER ================= */
  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /* ================= RECORD ================= */
  const start = async () => {
    if (hasRecorded) return;

    if (!streamRef.current) {
      await initCamera();
    }

    // Choose a supported mimeType with sensible fallbacks (video preferred, then audio)
    const candidates = [
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp8",
      "video/webm;codecs=vp9,opus",
      "audio/webm;codecs=opus",
      "audio/webm",
    ];
    const mimeType = candidates.find(t => MediaRecorder.isTypeSupported(t)) ?? "";
    // debug: which mimeType will be used
    console.debug("[useVideoRecorder] selected mimeType:", mimeType || "(default)");

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(streamRef.current!, mimeType ? { mimeType } : {});
    } catch (err) {
      // Some browsers may still throw when passing options — fall back to default ctor
      recorder = new MediaRecorder(streamRef.current!);
    }

    recorderRef.current = recorder;
    chunksRef.current = [];

    setMode("recording");
    setSeconds(0);
    setPaused(false);

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      // Use the chosen mimeType for the resulting blob if available
      const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);

      setPreviewURL(url);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.controls = true;
        videoRef.current.muted = false;
      }

      // MATIKAN KAMERA
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;

      setHasRecorded(true);
      setMode("review");
      stopTimer();
      chunksRef.current = [];
    };

    recorder.start(1000);
    startTimer();
  };

  const pause = () => {
    recorderRef.current?.pause();
    stopTimer();
    setPaused(true);
  };

  const resume = () => {
    recorderRef.current?.resume();
    startTimer();
    setPaused(false);
  };

  const stop = () => {
    recorderRef.current?.stop();
  };

  return {
    videoRef,
    previewURL,
    seconds,
    mode,
    paused,
    hasRecorded,
    initCamera,
    start,
    pause,
    resume,
    stop,
  };
}
