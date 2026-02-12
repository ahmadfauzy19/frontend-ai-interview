export type ListAnswer = {
  questionId: string;
  questionText: string;
  answerText: string;
  score: number;
  start: number;
  end: number;
};

export type SegmentItem = {
  questionId: string;
  start: number;
  end: number;
};

export type UploadResponse = {
  transcript: string;
  message: string;
  level: string;
  score: number;
  listAnswers: ListAnswer[];
  segments: {
    items: SegmentItem[];
  };
};
