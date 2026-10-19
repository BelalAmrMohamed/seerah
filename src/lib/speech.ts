// Helper for Browser Speech APIs (SpeechSynthesis & SpeechRecognition)

// Clean text for speech synthesis (remove markdown formatting & code)
export function cleanTextForSpeech(text: string): string {
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "كود برمجي")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove links [title](url) -> title
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove markdown headers #, ##, etc.
    .replace(/^#+\s+/gm, "")
    // Remove bold/italic * or _
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    // Remove blockquotes >
    .replace(/^>\s+/gm, "")
    // Remove bullet points - or *
    .replace(/^[-*+]\s+/gm, "")
    // Remove numbered lists 1.
    .replace(/^\d+\.\s+/gm, "")
    // Collapse extra whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ */
/*  Speech Synthesis (Read Aloud)                                     */
/* ------------------------------------------------------------------ */
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function speakText(
  rawText: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  stopSpeaking();

  const textToRead = cleanTextForSpeech(rawText);
  if (!textToRead) return false;

  const utterance = new SpeechSynthesisUtterance(textToRead);
  currentUtterance = utterance;

  // Find preferred Arabic voice if available
  const voices = window.speechSynthesis.getVoices();
  const arabicVoice =
    voices.find((v) => v.lang.startsWith("ar-SA") || v.lang.startsWith("ar_SA")) ||
    voices.find((v) => v.lang.startsWith("ar")) ||
    null;

  if (arabicVoice) {
    utterance.voice = arabicVoice;
    utterance.lang = arabicVoice.lang;
  } else {
    utterance.lang = "ar-SA";
  }

  utterance.rate = 0.95; // Slightly measured pace for classical clarity
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    // Interrupted is normal when user clicks stop
    if (e.error !== "interrupted" && e.error !== "canceled") {
      callbacks?.onError?.(e);
    } else {
      callbacks?.onEnd?.();
    }
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

/* ------------------------------------------------------------------ */
/*  Speech Recognition (Voice to Text Dictation)                      */
/* ------------------------------------------------------------------ */
// Type definitions for browser speech recognition
type SpeechRecognitionInstance = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

let activeRecognition: SpeechRecognitionInstance | null = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

export function startVoiceRecognition(callbacks: {
  onTranscript: (text: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}): () => void {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError?.("المتصفح لا يدعم التعرف الصوتي");
    return () => {};
  }

  stopVoiceRecognition();

  const SpeechRec =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

  if (!SpeechRec) {
    callbacks.onError?.("تعذر الوصول إلى محرك الصوت");
    return () => {};
  }

  const recognition = new SpeechRec();
  activeRecognition = recognition;

  recognition.lang = "ar-SA";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    callbacks.onStart?.();
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = "";
    let final = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res.isFinal) {
        final += res[0].transcript;
      } else {
        interim += res[0].transcript;
      }
    }

    if (final) {
      callbacks.onTranscript(final, true);
    } else if (interim) {
      callbacks.onTranscript(interim, false);
    }
  };

  recognition.onerror = (event) => {
    if (event.error !== "no-speech" && event.error !== "aborted") {
      callbacks.onError?.(event.error);
    }
  };

  recognition.onend = () => {
    activeRecognition = null;
    callbacks.onEnd?.();
  };

  try {
    recognition.start();
  } catch (err) {
    callbacks.onError?.("تعذر بدء التسجيل");
  }

  return () => {
    stopVoiceRecognition();
  };
}

export function stopVoiceRecognition(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
}
