import { useEffect, useRef, useState } from "react";
import styles from "./VideoRecorder.module.css";
import { useSpeechToText } from "./useSpeechToText";

export default function VideoRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);

  const {
    liveText,
    finalTranscript,
    start: startSTT,
    stop: stopSTT,
    reset: resetSTT,
  } = useSpeechToText("id-ID");

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      stopTimer();
      stopSTT();
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

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

  /* ================= RECORDING ================= */
  const startRecording = async () => {
    if (hasRecorded) return;

    resetSTT();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;
    videoRef.current!.srcObject = stream;

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
      ? "video/webm;codecs=vp8"
      : "video/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      videoRef.current!.srcObject = null;

      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setPreviewURL(URL.createObjectURL(blob));
      setHasRecorded(true);
      setRecording(false);
      setPaused(false);

      stopSTT();
      streamRef.current?.getTracks().forEach(t => t.stop());
      chunksRef.current = [];
    };

    recorder.start(1000);
    startSTT();
    startTimer();
    setSeconds(0);
    setRecording(true);
    setPaused(false);
  };

  const pauseRecording = () => {
    recorderRef.current?.pause();
    stopTimer();
    stopSTT();
    setPaused(true);
  };

  const resumeRecording = () => {
    recorderRef.current?.resume();
    startTimer();
    startSTT();
    setPaused(false);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    stopTimer();
  };

  /* ================= SAVE ================= */
  const uploadVideo = async () => {
    if (!previewURL) return;

    const videoBlob = await fetch(previewURL).then(r => r.blob());
    console.log("video blob", videoBlob);

    const formData = new FormData();
    formData.append("video", videoBlob, "interview.webm");
    // formData.append("transcript", finalTranscript.trim());
    console.log("form data", formData);

    // await fetch("http://localhost:8081/api/media/upload", {
    //   method: "POST",
    //   body: formData,
    // });

    alert("Video berhasil disimpan");
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  /* ================= UI ================= */
  return (
    <div className={styles.wrapper}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay={!previewURL}
          muted={!previewURL}
          controls={!!previewURL}
          src={previewURL || undefined}
        />

        <div className={styles.timer}>{formatTime(seconds)}</div>

        {/* {recording && (
          <div className={styles.subtitle}>
            {(finalTranscript + liveText).trim() ||
              "Silakan mulai berbicara..."}
          </div>
        )} */}
      </div>

      <div className={styles.controls}>
        {!hasRecorded && !recording && (
          <button onClick={startRecording} className={styles.primary}>
            ▶️ Start
          </button>
        )}

        {recording && !paused && (
          <button onClick={pauseRecording} className={styles.secondary}>
            ⏸ Pause
          </button>
        )}

        {recording && paused && (
          <button onClick={resumeRecording} className={styles.secondary}>
            ▶️ Resume
          </button>
        )}

        {recording && (
          <button onClick={stopRecording} className={styles.danger}>
            ⏹ Stop
          </button>
        )}

        {hasRecorded && previewURL && (
          <button onClick={uploadVideo} className={styles.primary}>
            ⬆ Upload
          </button>
        )}
      </div>
    </div>
  );
}
