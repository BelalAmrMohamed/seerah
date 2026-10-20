import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  BOOKMARKS: "seerah_bookmarks_v1",
  COMPLETED: "seerah_completed_v1",
  READING_SETTINGS: "seerah_settings_v1",
  CHAT_SESSIONS: "seerah_chat_sessions_v1",
};

export interface ReadingSettings {
  fontSize: number; // default 18
  tashkeel: boolean; // default true
}

// Bookmarks
export async function getBookmarks(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleBookmark(stationId: number): Promise<boolean> {
  try {
    const current = await getBookmarks();
    const exists = current.includes(stationId);
    const updated = exists ? current.filter((id) => id !== stationId) : [...current, stationId];
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

// Completed Stations Progress
export async function getCompletedStations(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.COMPLETED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleCompletedStation(stationId: number): Promise<boolean> {
  try {
    const current = await getCompletedStations();
    const exists = current.includes(stationId);
    const updated = exists ? current.filter((id) => id !== stationId) : [...current, stationId];
    await AsyncStorage.setItem(KEYS.COMPLETED, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

// Reading Preferences
export async function getReadingSettings(): Promise<ReadingSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.READING_SETTINGS);
    return raw ? JSON.parse(raw) : { fontSize: 18, tashkeel: true };
  } catch {
    return { fontSize: 18, tashkeel: true };
  }
}

export async function saveReadingSettings(settings: ReadingSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.READING_SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore error
  }
}

// Chat Persistence
export interface LocalChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface LocalChatSession {
  id: string;
  title: string;
  stationId?: number;
  messages: LocalChatMessage[];
  createdAt: number;
}

export async function getChatSessions(): Promise<LocalChatSession[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CHAT_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveChatSessions(sessions: LocalChatSession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  } catch {
    // Ignore error
  }
}
