import { useState } from "react";
import VideoRecorder from "../components/videoRecorder";
import UploadMedia from "../components/uploadMedia";
import styles from "../assets/style/speechToText.module.css";

export default function SpeechToTextPage() {
  const [tab, setTab] = useState<"record" | "upload">("record");

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>AI INTERVIEW</h1>

      <div className={styles.tabbar} role="tablist">
        <button
          className={`${styles.tab} ${tab === "record" ? styles.active : ""}`}
          onClick={() => setTab("record")}
          role="tab"
          aria-selected={tab === "record"}
        >
          ▶️ Rekam Video
        </button>

        <button
          className={`${styles.tab} ${tab === "upload" ? styles.active : ""}`}
          onClick={() => setTab("upload")}
          role="tab"
          aria-selected={tab === "upload"}
        >
          ⬆ Upload File (Video / Musik)
        </button>
      </div>

      <section className={styles.content}>
        {tab === "record" && (
          <div>
            <p className={styles.lead}>Silakan rekam jawaban Anda. Sistem mendukung perekaman video dengan mikrofon.</p>
            <VideoRecorder />
          </div>
        )}

        {tab === "upload" && (
          <div>
            <p className={styles.lead}>Anda dapat meng-upload file video atau musik.</p>
            <UploadMedia />
          </div>
        )}
      </section>
    </main>
  );
}
