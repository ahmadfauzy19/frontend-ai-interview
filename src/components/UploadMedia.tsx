import { useCallback, useState } from "react";
import styles from "../assets/style/speechToText.module.css";
import { uploadMediaFiles } from "../services/uploadMediaService";

type Preview = {
  file: File;
  url: string;
  kind: "video" | "audio" | "other";
};

export default function UploadMedia() {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const next: Preview[] = [];

    Array.from(files).forEach(file => {
      const kind = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "other";

      const url = URL.createObjectURL(file);
      next.push({ file, url, kind });
    });

    setPreviews(p => [...p, ...next]);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.currentTarget.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const remove = (index: number) => {
    setPreviews(p => {
      const copy = [...p];
      URL.revokeObjectURL(copy[index].url);
      copy.splice(index, 1);
      return copy;
    });
  };

  const uploadAll = async () => {
    if (previews.length === 0) return alert("Pilih file terlebih dahulu");

    setUploading(true);
    try {
      const files = previews.map(p => p.file);
      const response = await uploadMediaFiles(files);

      setTranscript(response.transcript);
      setMessage(response.message);
      alert("File berhasil di-upload");
      
      // clear previews
      previews.forEach(p => URL.revokeObjectURL(p.url));
      setPreviews([]);
    } catch (err) {
      console.error(err);
      alert("Gagal meng-upload file. Cek console untuk detail.");
      setTranscript("");
      setMessage("");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.uploadWrapper}>
      <div
        className={styles.dropzone}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <p>Tarik & lepas file di sini atau klik tombol untuk memilih file</p>
        <input
          type="file"
          accept="video/*,audio/*"
          multiple
          onChange={onInputChange}
          className={styles.fileInput}
        />
      </div>

      <div className={styles.previewList}>
        {previews.map((p, i) => (
          <div key={i} className={styles.previewItem}>
            {p.kind === "video" ? (
              <video src={p.url} controls className={styles.previewMedia} />
            ) : p.kind === "audio" ? (
              <audio src={p.url} controls className={styles.previewMedia} />
            ) : (
              <div className={styles.previewFallback}>{p.file.name}</div>
            )}

            <div className={styles.previewMeta}>
              <div className={styles.filename}>{p.file.name}</div>
              <button className={styles.removeBtn} onClick={() => remove(i)}>
                ✖ Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.uploadActions}>
        <button onClick={uploadAll} className={styles.primary} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Semua"}
        </button>
      </div>

      {message && (
        <div className={styles.resultWrapper}>
          <h3>{message}</h3>
          {transcript && (
            <div className={styles.transcriptBox}>
              <p>{transcript}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
