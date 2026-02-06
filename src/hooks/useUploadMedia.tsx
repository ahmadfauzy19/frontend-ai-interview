import { useState } from "react";
import { uploadMediaFiles, uploadSingleMedia } from "../services/mediaService";

export type UploadResult = {
  message: string;
  transcript: string;
  questionId?: string;
  level?: string;
  score?: number;
};

export function useUploadMedia() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
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
    blob: Blob,
    filename: string,
    questionId?: string,
    level?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadSingleMedia(blob, filename, questionId, level);
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
