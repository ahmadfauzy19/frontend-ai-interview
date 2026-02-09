import { useRef, useState } from "react";

type Mode = "preview" | "recording" | "review";

export function useVideoRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0); // milliseconds elapsed before current running period

  // seconds is a floating number (seconds with millisecond precision)
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [mode, setMode] = useState<Mode>("preview");

  // segment tracking
  const segmentsRef = useRef<{ questionId: string; start: number; end?: number }[]>([]);
  const currentSegmentStartRef = useRef<number | null>(null);
  const [finishing, setFinishing] = useState(false);


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
    // update with millisecond precision every 100ms
    timerRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsedMs = Date.now() - startTimeRef.current - pausedTimeRef.current;
      setSeconds(elapsedMs / 1000);
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /* ================= RECORD ================= */
  const start = async () => {
    // If user already has a recorded preview, allow starting a fresh recording by resetting preview/flag
    if (hasRecorded) {
      setHasRecorded(false);
      setPreviewURL(null);
    }

    if (!streamRef.current) {
      await initCamera();
    }

    const recorder = new MediaRecorder(streamRef.current!, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : "video/webm",
    });

    recorderRef.current = recorder;
    chunksRef.current = [];

    // initialize segment tracking
    segmentsRef.current = [];
    currentSegmentStartRef.current = 0;
    setFinishing(false);

    setMode("recording");
    setSeconds(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    setPaused(false);

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      // simpan blob agar tidak perlu fetch blob:URL yang dapat memicu range error
      recordedBlobRef.current = blob;

      // revoke previous previewURL jika ada
      if (previewURL) {
        try { URL.revokeObjectURL(previewURL); } catch {}
      }

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

      // ensure seconds reflect final elapsed
      if (startTimeRef.current) {
        const elapsedMs = Date.now() - startTimeRef.current - pausedTimeRef.current;
        setSeconds(elapsedMs / 1000);
      }

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
    // capture elapsed ms so far
    if (startTimeRef.current) {
      pausedTimeRef.current = Date.now() - startTimeRef.current - pausedTimeRef.current;
    }
    stopTimer();
    setPaused(true);
  };

  const resume = () => {
    recorderRef.current?.resume();
    // restart the startTime so elapsed calculation continues from pausedTimeRef
    startTimeRef.current = Date.now();
    startTimer();
    setPaused(false);
  };

  const stop = () => {
    recorderRef.current?.stop();
  };

  // segment helpers
  const nextSegment = async (questionId: string, isLast = false) => {
    const currentSeconds = seconds;
    const start = currentSegmentStartRef.current ?? 0;
    const segment = { questionId, start, end: currentSeconds };

    segmentsRef.current.push(segment);

    // push segment locally; final upload will include segments object

    if (isLast) {
      setFinishing(true);
      stop();
    } else {
      currentSegmentStartRef.current = currentSeconds;
    }
  };

  const getSegments = () => segmentsRef.current;

  const clearSegments = () => {
    segmentsRef.current = [];
    currentSegmentStartRef.current = null;
    setFinishing(false);
  };

  const isFinishing = () => finishing;

  const getRecordingBlob = async () => {
    // jika blob sudah tersedia, kembalikan langsung
    if (recordedBlobRef.current) return recordedBlobRef.current;

    throw new Error("Recording not finalized. Stop the recorder to finalize the blob.");
  };

  return {
    videoRef,
    previewURL,
    seconds,
    mode,
    paused,
    hasRecorded,
    finishing,
    initCamera,
    start,
    pause,
    resume,
    stop,
    nextSegment,
    getSegments,
    clearSegments,
    isFinishing,
    getRecordingBlob,
  };
}
