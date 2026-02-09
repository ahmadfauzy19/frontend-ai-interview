import { useRef, useState } from "react";

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInterface {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  start(): void;
  stop(): void;
}

export function useSpeechToText(lang = "id-ID") {
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);

  const [liveText, setLiveText] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  const start = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition: SpeechRecognitionInterface = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = event => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        if (result.isFinal) {
          setFinalTranscript(prev => prev + result[0].transcript + " ");
        } else {
          interim += result[0].transcript;
        }
      }

      setLiveText(interim);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stop = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setLiveText("");
  };

  const reset = () => {
    setLiveText("");
    setFinalTranscript("");
  };

  return {
    liveText,
    finalTranscript,
    start,
    stop,
    reset,
  };
}