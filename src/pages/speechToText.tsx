import { useEffect, useMemo, useState } from "react";
import styles from "../assets/style/speechToText.module.css";
import { fetchLevel } from "../services/mediaService";
import type { Level, Question } from "../services/mediaService";
import { useVideoRecorder } from "../hooks/useVideoRecorder";
import { useUploadMedia } from "../hooks/useUploadMedia";

const STATIC_LEVELS: Pick<Level, "_id" | "level">[] = [
  { _id: "junior", level: "JUNIOR" },
  { _id: "middle", level: "MIDDLE" },
  { _id: "senior", level: "SENIOR" },
];



export default function SpeechToTextPage() {
  const [selectedLevel, setSelectedLevel] = useState("junior");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const recorder = useVideoRecorder();
  const { uploadSingle, loading, result, error } = useUploadMedia();

  const selectedQuestion = useMemo(
    () => questions.find(q => q.question_id === selectedQuestionId),
    [questions, selectedQuestionId]
  );

  /* ================= INIT CAMERA ================= */
  // Only perform cleanup on unmount
  useEffect(() => {
    return () => recorder.stop();
  }, []);

  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchLevel(selectedLevel);
        const list = data.list_pertanyaan || [];
        setQuestions(list);
        // auto-select first question and prevent user from changing it
        setSelectedQuestionId(list.length > 0 ? list[0].question_id : null);
      } catch {
        setQuestions([]);
        setSelectedQuestionId(null);
      }
    })();
  }, [selectedLevel]);

  /* ================= UPLOAD / SEGMENT ================= */
  const uploadRecorded = async () => {
    if (!recorder.previewURL) return;
    const blob = await fetch(recorder.previewURL).then(r => r.blob());
    const segments = recorder.getSegments ? (recorder.getSegments().length ? recorder.getSegments() : undefined) : undefined;
    await uploadSingle(blob, "interview.webm", undefined, selectedLevel, segments);
    // clear segments in hook
    recorder.clearSegments?.();
  };

  // handle start via hook
  const handleStart = async () => {
    await recorder.start();
  };

  // next or finish handled by hook; after calling nextSegment, update UI selectedQuestion
  const handleNextOrFinish = async () => {
    if (!recorder || recorder.mode !== "recording" || !selectedQuestionId) return;

    const idx = questions.findIndex(q => q.question_id === selectedQuestionId);
    const isLast = idx === questions.length - 1;

    await recorder.nextSegment(selectedQuestionId, isLast);

    if (!isLast) {
      const next = questions[idx + 1];
      setSelectedQuestionId(next.question_id);
    }
  };

  const currentIdx = questions.findIndex(q => q.question_id === selectedQuestionId);
  const isLast = currentIdx >= 0 && currentIdx === questions.length - 1;

  // when the hook reports the recorder is in review and finishing was requested, upload final video + segments
  useEffect(() => {
    if (recorder.mode !== "review") return;
    if (!recorder.finishing) return;

    (async () => {
      try {
        const blob = await recorder.getRecordingBlob();
        const segments = recorder.getSegments().length ? recorder.getSegments() : undefined;
        await uploadSingle(blob, "interview.webm", undefined, selectedLevel, segments);
      } catch (e) {
        console.error("Gagal upload final:", e);
      } finally {
        recorder.clearSegments?.();
      }
    })();
  }, [recorder.mode, recorder.finishing]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>AI INTERVIEW</h1>

        <select
          value={selectedLevel}
          onChange={e => setSelectedLevel(e.target.value)}
        >
          {STATIC_LEVELS.map(l => (
            <option key={l._id} value={l._id}>
              {l.level}
            </option>
          ))}
        </select>
      </header>

      <section className={styles.layout}>
        {/* ================= LEFT ================= */}
        <aside className={styles.leftPanel}>
          <h3>Pertanyaan</h3>

          {questions.map(q => (
            <label key={q.question_id} className={styles.questionItem}>
              <input
                type="radio"
                checked={q.question_id === selectedQuestionId}
                disabled
                onChange={() => setSelectedQuestionId(q.question_id)}
              />
              {q.pertanyaan}
            </label>
          ))}

          {selectedQuestion && (
            <div className={styles.activeQuestion}>
              {selectedQuestion.pertanyaan}
            </div>
          )}
        </aside>

        {/* ================= RIGHT ================= */}
        <section className={styles.videoPanel}>
          <div className={styles.videoWrapper}>
            <video
              ref={recorder.videoRef}
              autoPlay
              playsInline
              muted={recorder.mode !== "review"}
            />

            <div className={styles.timer}>{recorder.seconds}s</div>
          </div>

          <div className={styles.controls}>
            {recorder.mode === "preview" && (
              <button onClick={handleStart}>▶ Start</button>
            )}

            {recorder.mode === "recording" && !recorder.paused && (
              <button onClick={recorder.pause}>⏸ Pause</button>
            )}

            {recorder.mode === "recording" && recorder.paused && (
              <button onClick={recorder.resume}>▶ Resume</button>
            )}

            {recorder.mode === "recording" && (
              <>
                <button onClick={handleNextOrFinish}>{isLast ? "Finish" : "Next Question"}</button>
              </>
            )}

            {recorder.mode === "review" && (
              <button onClick={uploadRecorded}>⬆ Upload Rekaman</button>
            )}
          </div>
        </section>
      </section>

      {/* ================= RESULT ================= */}
      {loading && <div className={styles.loading}>⏳ Menilai jawaban…</div>}
      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.resultBox}>
          <h3>{result.message}</h3>
          <p><b>Score:</b> {result.score}</p>
          <pre>{result.transcript}</pre>
        </div>
      )}
    </main>
  );
}
