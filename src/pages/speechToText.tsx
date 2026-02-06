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
  useEffect(() => {
    if (selectedQuestionId) recorder.initCamera();
    return recorder.stop;
  }, [selectedQuestionId]);

  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchLevel(selectedLevel);
        setQuestions(data.list_pertanyaan || []);
        setSelectedQuestionId(null);
      } catch {
        setQuestions([]);
      }
    })();
  }, [selectedLevel]);

  /* ================= UPLOAD ================= */
  const uploadRecorded = async () => {
    if (!recorder.previewURL || !selectedQuestionId) return;
    const blob = await fetch(recorder.previewURL).then(r => r.blob());
    await uploadSingle(blob, "interview.webm", selectedQuestionId, selectedLevel);
  };

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
              <button onClick={recorder.start}>▶ Start</button>
            )}

            {recorder.mode === "recording" && !recorder.paused && (
              <button onClick={recorder.pause}>⏸ Pause</button>
            )}

            {recorder.mode === "recording" && recorder.paused && (
              <button onClick={recorder.resume}>▶ Resume</button>
            )}

            {recorder.mode === "recording" && (
              <button onClick={recorder.stop}>⏹ Stop</button>
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
