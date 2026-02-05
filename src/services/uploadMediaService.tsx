type UploadResponse = {
  transcript: string;
  message: string;
};

export const uploadMediaFiles = async (
  files: File[]
): Promise<UploadResponse> => {
  const form = new FormData();
  files.forEach((file) => {
    form.append("file", file, file.name);
  });

  const response = await fetch("http://localhost:8081/api/media/upload", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("Gagal meng-upload file");
  }

  return response.json();
};
