import * as Speech from "expo-speech";

// Same text clean-up as the website's lib/speech.ts, now on top of expo-speech (Android TTS).
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "كود برمجي")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
export function stopSpeaking() { Speech.stop(); }
export function speakText(raw: string, cb?: { onStart?: () => void; onEnd?: () => void; onError?: () => void }) {
  const text = cleanTextForSpeech(raw);
  if (!text) return false;
  Speech.stop();
  Speech.speak(text, {
    language: "ar-SA",
    rate: 0.92,
    onStart: cb?.onStart,
    onDone: cb?.onEnd,
    onStopped: cb?.onEnd,
    onError: cb?.onError,
  });
  return true;
}
