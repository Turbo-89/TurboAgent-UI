"use client";

import MicIcon from "./MicIcon";
import useSpeech from "./useSpeech";

export default function MicButton({ onTranscript }: { onTranscript: (t: string) => void }) {
  const { start, stop, recording } = useSpeech((finalText: string) => {
    onTranscript(finalText); // transcript doorgeven aan chatinput
  });

  const toggleMic = () => {
    if (recording) {
      stop();
    } else {
      start();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleMic}
      className={`p-2 rounded ${
        recording ? "bg-red-600" : "bg-neutral-700"
      } text-white`}
    >
      <MicIcon active={recording} />
    </button>
  );
}
