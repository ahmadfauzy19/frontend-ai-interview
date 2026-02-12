import { useEffect, useMemo, useState } from "react";
import styles from "../assets/style/speechToText.module.css";
import { fetchLevel } from "../services/mediaService";
import type { Question } from "../services/mediaService";
import { useVideoRecorder } from "../hooks/useVideoRecorder";
import { useUploadMedia } from "../hooks/useUploadMedia";
import { useInterview } from "../contexts/interviewContext";

import AppLayout from "./appLayout";



export default function SpeechToTextPage() {
  const { level, name } = useInterview();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<string, number>>({});


  const recorder = useVideoRecorder();
  const { uploadSingle, loading, result, error } = useUploadMedia();

  const selectedQuestion = useMemo(
    () => questions.find(q => q.questionId === selectedQuestionId),
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
        const data = await fetchLevel(level);
        const list = data.questions || [];
        setQuestions(list);
        // auto-select first question and prevent user from changing it
        setSelectedQuestionId(list.length > 0 ? list[0].questionId : null);
      } catch (e) {
        console.error("Failed to fetch level data:", e);
        setQuestions([]);
        setSelectedQuestionId(null);
      }
    })();
  }, [level]);

  useEffect(() => {
    if (!result?.listAnswers) return;

    const map: Record<string, number> = {};
    result.listAnswers.forEach((item: any) => {
      map[item.questionId] = item.score;
    });

    setAnswersMap(map);
  }, [result]);


  /* ================= UPLOAD / SEGMENT ================= */
  const uploadRecorded = async () => {
    if (!recorder.previewURL) return;
    const blob = await fetch(recorder.previewURL).then(r => r.blob());
    const segments = recorder.getSegments ? (recorder.getSegments().length ? recorder.getSegments() : undefined) : undefined;
    await uploadSingle(name,blob, "interview.webm", undefined, level, segments);
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

    const idx = questions.findIndex(q => q.questionId === selectedQuestionId);
    const isLast = idx === questions.length - 1;

    await recorder.nextSegment(selectedQuestionId, isLast);

    if (!isLast) {
      const next = questions[idx + 1];
      setSelectedQuestionId(next.questionId);
    }
  };

  const currentIdx = questions.findIndex(q => q.questionId === selectedQuestionId);
  const isLast = currentIdx >= 0 && currentIdx === questions.length - 1;

  return (
    <AppLayout title="Interview">
      <main className={styles.page}>
        {result && (
          <div className={styles.summaryBar}>
            <div>Hasil Interview : </div>
            <div className={styles.avgScore}>
              Rata-Rata Skor: {result.score}
            </div>
          </div>
        )}
        <section className={styles.layout}>
          {/* ================= LEFT ================= */}
          <aside className={styles.leftPanel}>
            <h3>Pertanyaan</h3>
            {questions.map((q, index) => {
              const score = answersMap[q.questionId];
              const isAnswered = score !== undefined;

              return (
                <div
                  key={q.questionId}
                  className={`${styles.questionTab} 
                    ${q.questionId === selectedQuestionId ? styles.activeTab : ""}
                  `}
                  onClick={() => {
                    if (isAnswered) setSelectedQuestionId(q.questionId);
                  }}
                >
                  <div className={styles.questionLeft}>
                    <span className={styles.questionNumber}>
                      {index + 1}.
                    </span>

                    <span className={styles.questionText}>
                      {q.question}
                    </span>
                  </div>
                </div>
              );
            })}
          </aside>

          {/* ================= RIGHT ================= */}
          <section className={styles.videoPanel}>
            {/* QUESTION HEADER */}
            {selectedQuestion && (
              <div className={styles.currentQuestion}>
                <span>{selectedQuestion.question}</span>

                {answersMap[selectedQuestion.questionId] !== undefined && (
                  <span className={styles.currentScore}>
                    Score: {answersMap[selectedQuestion.questionId]}
                  </span>
                )}
              </div>
            )}

            {/* VIDEO */}
            <div className={styles.videoWrapper}>
              <video
                ref={recorder.videoRef}
                autoPlay
                playsInline
                muted={recorder.mode !== "review"}
              />
              <div className={styles.timer}>{recorder.seconds}s</div>
            </div>

            {/* CONTROLS */}
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
                <button onClick={handleNextOrFinish}>
                  {isLast ? "Finish" : "Next Question"}
                </button>
              )}

              {recorder.mode === "review" && (
                <button
                  onClick={() => uploadRecorded()}
                  disabled={!!result}   // ✅ disable jika sudah ada result
                  className={result ? styles.disabledBtn : ""}
                >
                  ⬆ Upload Rekaman
                </button>
              )}
            </div>

            {/* ANSWER BELOW VIDEO */}
      
            {selectedQuestion &&
              answersMap[selectedQuestion.questionId] !== undefined && (
                <>
                  <div className={styles.sectionDivider}></div>

                  <div className={styles.answerSection}>
                    <div className={styles.answerLabel}>Jawaban :</div>
                    <div className={styles.currentAnswer}>
                      {
                        result?.listAnswers?.find(
                          a => a.questionId === selectedQuestion.questionId
                        )?.answerText || "-"
                      }
                    </div>
                  </div>
                </>
            )}

          </section>

        </section>

        {/* ================= RESULT ================= */}
        {loading && <div className={styles.loading}>⏳ Menilai jawaban…</div>}
        {error && <div className={styles.error}>{error}</div>}
      </main>
    </AppLayout>
  );
}
