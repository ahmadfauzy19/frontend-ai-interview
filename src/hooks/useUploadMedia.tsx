import { useState } from "react";
import { uploadMediaFiles, uploadSingleMedia } from "../services/mediaService";
import type { UploadResponse } from "../dto/answerResponseDto";


export function useUploadMedia() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (
    files: File[],
    questionId?: string,
    level?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadMediaFiles(files, questionId, level);
      setResult(res);
      return res;
    } catch (e) {
      console.error(e);
      setError("Gagal upload file");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const uploadSingle = async (
    name: string,
    blob: Blob,
    filename: string,
    questionId?: string,
    level?: string,
    segments?: { questionId: string; start: number; end?: number }[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadSingleMedia(name ,blob, filename, questionId, level, segments);
      setResult(res);
      return res;
    } catch (e) {
      console.error(e);
      setError("Gagal upload rekaman");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    error,
    uploadFiles,
    uploadSingle,
    reset: () => setResult(null),
  };
}
