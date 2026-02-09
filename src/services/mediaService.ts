export type UploadResponse = {
  transcript: string;
  message: string;
};

export type Question = {
  question_id: string;
  pertanyaan: string;
  rubrik_penilaian: Record<string, string>;
  jawaban_karyawan: string;
};

export type Level = {
  _id: string;
  level: string;
  role: string;
  technology: string;
  list_pertanyaan: Question[];
};

const API_BASE = import.meta.env?.VITE_API_BASE;

if (!API_BASE) {
  throw new Error("API_BASE is not defined in environment variables");
}

export const uploadMediaFiles = async (
  files: File[] | Blob[],
  questionId?: string,
  level?: string
): Promise<UploadResponse> => {
  const form = new FormData();
  files.forEach((file) => {
    form.append("file", file as any, (file as File).name || "file");
  });

  if (questionId) form.append("questionId", questionId);
  if (level) form.append("level", level);

  const response = await fetch(`${API_BASE}/media/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("Gagal meng-upload file");
  }

  return response.json();
};

export const uploadSingleMedia = async (
  blob: Blob,
  filename = "file",
  questionId?: string,
  level?: string,
  segments?: { questionId: string; start: number; end?: number }[]
): Promise<UploadResponse> => {
  const form = new FormData();
  form.append("file", blob, filename);
  if (questionId) form.append("questionId", questionId);
  if (level) form.append("level", level);
  if (segments && segments.length > 0) {
    // form.append("segments", JSON.stringify(segments));
    form.append(
      "segments",
      new Blob(
        [JSON.stringify({ items: segments })],
        { type: "application/json" }
      )
    );
  }

  const response = await fetch(`${API_BASE}/media/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) throw new Error("Gagal meng-upload file");
  return response.json();
};

export const fetchLevels = async (): Promise<Pick<Level, "_id" | "level">[]> => {
  const response = await fetch(`${API_BASE}/levels`, { method: "GET" });
  if (!response.ok) throw new Error("Gagal mengambil daftar level");
  return response.json();
};

export const fetchLevel = async (id: string): Promise<Level> => {
  const response = await fetch(`${API_BASE}/media/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("Gagal mengambil data level");
  return response.json();
};
