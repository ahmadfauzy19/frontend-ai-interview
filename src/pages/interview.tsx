import VideoRecorder from "../components/videoRecorder";

export default function InterviewPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>🎤 Interview Online</h1>
      <p>Silakan rekam jawaban Anda</p>

      <VideoRecorder />
    </main>
  );
}
