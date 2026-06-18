"use client";

import { useState, useRef } from "react";

export default function useSpeech(onResult: (text: string) => void) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  function start() {
    // Fallback naar browser Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Spraakherkenning wordt niet ondersteund door deze browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "nl-BE";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    recognition.onerror = () => {
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stop() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  }

  return { start, stop, recording };
}
