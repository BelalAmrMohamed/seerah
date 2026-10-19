import { create } from "zustand";
import { persist } from "zustand/middleware";
import { stations } from "./stations";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  parentId?: string;
  childrenIds: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  pinned: boolean;
  stationId?: number;
  createdAt: number;
  updatedAt: number;
  messages: Record<string, ChatMessage>;
  activeLeafId?: string;
  rootMessageId?: string;
}

interface ChatStoreState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  sidebarOpen: boolean;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveSessionId: (id: string | null) => void;
  createNewSession: (stationId?: number, initialPrompt?: string) => string;
  deleteSession: (id: string) => void;
  togglePinSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  clearAllSessions: () => void;

  // Messages & Branching
  addMessage: (sessionId: string, role: "user" | "assistant", content: string, parentId?: string) => string;
  updateMessageContent: (sessionId: string, messageId: string, content: string) => void;
  switchBranch: (sessionId: string, targetMessageId: string) => void;
  editPromptAndBranch: (sessionId: string, messageId: string, newContent: string) => string;
}

// Helper: Traverse back from leaf to root to get the linear thread of active messages
export function getActiveThread(session?: ChatSession | null): ChatMessage[] {
  if (!session || !session.activeLeafId || !session.messages[session.activeLeafId]) {
    // If no active leaf, check if there are any messages
    const msgs = Object.values(session?.messages || {});
    return msgs.sort((a, b) => a.timestamp - b.timestamp);
  }

  const thread: ChatMessage[] = [];
  let currId: string | undefined = session.activeLeafId;

  while (currId && session.messages[currId]) {
    const msg: ChatMessage = session.messages[currId];
    thread.unshift(msg);
    currId = msg.parentId;
  }

  return thread;
}

// Helper: Find deepest leaf under a specific message branch
function getDeepestLeaf(messages: Record<string, ChatMessage>, startId: string): string {
  let currId = startId;
  while (messages[currId] && messages[currId].childrenIds.length > 0) {
    const children = messages[currId].childrenIds;
    currId = children[children.length - 1]; // choose most recent branch
  }
  return currId;
}

// Helper: Get siblings of a message for branch navigation (< 1 / 2 >)
export function getMessageSiblings(
  session: ChatSession,
  messageId: string
): { siblings: string[]; currentIndex: number } {
  const msg = session.messages[messageId];
  if (!msg) return { siblings: [messageId], currentIndex: 0 };

  if (!msg.parentId) {
    // Root level messages
    const rootSiblings = Object.values(session.messages)
      .filter((m) => !m.parentId && m.role === msg.role)
      .map((m) => m.id);
    const idx = rootSiblings.indexOf(messageId);
    return { siblings: rootSiblings.length > 0 ? rootSiblings : [messageId], currentIndex: Math.max(0, idx) };
  }

  const parent = session.messages[msg.parentId];
  if (!parent) return { siblings: [messageId], currentIndex: 0 };

  const siblings = parent.childrenIds || [];
  const currentIndex = siblings.indexOf(messageId);
  return {
    siblings: siblings.length > 0 ? siblings : [messageId],
    currentIndex: Math.max(0, currentIndex),
  };
}

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      sidebarOpen: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      setActiveSessionId: (id) => set({ activeSessionId: id }),

      createNewSession: (stationId, initialPrompt) => {
        const id = "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
        let title = "محادثة جديدة";
        if (stationId) {
          const st = stations.find((s) => s.id === stationId);
          if (st) title = `سياق: محطة ${st.id} — ${st.title}`;
        } else if (initialPrompt) {
          title = initialPrompt.slice(0, 36) + (initialPrompt.length > 36 ? "…" : "");
        }

        const newSession: ChatSession = {
          id,
          title,
          pinned: false,
          stationId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: {},
        };

        set((s) => ({
          sessions: [newSession, ...s.sessions],
          activeSessionId: id,
          sidebarOpen: false,
        }));

        return id;
      },

      deleteSession: (id) => {
        set((s) => {
          const filtered = s.sessions.filter((ses) => ses.id !== id);
          const nextActive = s.activeSessionId === id ? (filtered[0]?.id || null) : s.activeSessionId;
          return { sessions: filtered, activeSessionId: nextActive };
        });
      },

      togglePinSession: (id) => {
        set((s) => ({
          sessions: s.sessions.map((ses) => (ses.id === id ? { ...ses, pinned: !ses.pinned } : ses)),
        }));
      },

      renameSession: (id, newTitle) => {
        if (!newTitle.trim()) return;
        set((s) => ({
          sessions: s.sessions.map((ses) => (ses.id === id ? { ...ses, title: newTitle.trim(), updatedAt: Date.now() } : ses)),
        }));
      },

      clearAllSessions: () => {
        set({ sessions: [], activeSessionId: null });
      },

      addMessage: (sessionId, role, content, parentId) => {
        const msgId = "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
        const timestamp = Date.now();

        set((s) => {
          const session = s.sessions.find((ses) => ses.id === sessionId);
          if (!session) return s;

          const effectiveParentId = parentId !== undefined ? parentId : session.activeLeafId;

          const newMsg: ChatMessage = {
            id: msgId,
            role,
            content,
            timestamp,
            parentId: effectiveParentId,
            childrenIds: [],
          };

          const updatedMessages = { ...session.messages, [msgId]: newMsg };

          // If it has a parent, attach this child
          if (effectiveParentId && updatedMessages[effectiveParentId]) {
            const parent = updatedMessages[effectiveParentId];
            if (!parent.childrenIds.includes(msgId)) {
              updatedMessages[effectiveParentId] = {
                ...parent,
                childrenIds: [...parent.childrenIds, msgId],
              };
            }
          }

          // Auto-title on first user message if default
          let title = session.title;
          if (role === "user" && (title === "محادثة جديدة" || Object.keys(session.messages).length === 0)) {
            title = content.trim().slice(0, 36) + (content.trim().length > 36 ? "…" : "");
          }

          const updatedSession: ChatSession = {
            ...session,
            title,
            updatedAt: timestamp,
            messages: updatedMessages,
            activeLeafId: msgId,
            rootMessageId: session.rootMessageId || (role === "user" && !effectiveParentId ? msgId : session.rootMessageId),
          };

          return {
            sessions: s.sessions.map((ses) => (ses.id === sessionId ? updatedSession : ses)),
          };
        });

        return msgId;
      },

      updateMessageContent: (sessionId, messageId, content) => {
        set((s) => ({
          sessions: s.sessions.map((ses) => {
            if (ses.id !== sessionId || !ses.messages[messageId]) return ses;
            return {
              ...ses,
              updatedAt: Date.now(),
              messages: {
                ...ses.messages,
                [messageId]: { ...ses.messages[messageId], content },
              },
            };
          }),
        }));
      },

      switchBranch: (sessionId, targetMessageId) => {
        set((s) => {
          const session = s.sessions.find((ses) => ses.id === sessionId);
          if (!session || !session.messages[targetMessageId]) return s;

          // Find deepest leaf under target message
          const newLeaf = getDeepestLeaf(session.messages, targetMessageId);

          return {
            sessions: s.sessions.map((ses) =>
              ses.id === sessionId ? { ...ses, activeLeafId: newLeaf, updatedAt: Date.now() } : ses
            ),
          };
        });
      },

      editPromptAndBranch: (sessionId, messageId, newContent) => {
        const msgId = "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
        const timestamp = Date.now();

        set((s) => {
          const session = s.sessions.find((ses) => ses.id === sessionId);
          if (!session || !session.messages[messageId]) return s;

          const oldMsg = session.messages[messageId];
          const parentId = oldMsg.parentId;

          const newMsg: ChatMessage = {
            id: msgId,
            role: "user",
            content: newContent,
            timestamp,
            parentId,
            childrenIds: [],
          };

          const updatedMessages = { ...session.messages, [msgId]: newMsg };

          // Attach to parent's children
          if (parentId && updatedMessages[parentId]) {
            const parent = updatedMessages[parentId];
            updatedMessages[parentId] = {
              ...parent,
              childrenIds: [...parent.childrenIds, msgId],
            };
          }

          const updatedSession: ChatSession = {
            ...session,
            updatedAt: timestamp,
            messages: updatedMessages,
            activeLeafId: msgId,
          };

          return {
            sessions: s.sessions.map((ses) => (ses.id === sessionId ? updatedSession : ses)),
          };
        });

        return msgId;
      },
    }),
    {
      name: "rihla_chat_sessions_v1",
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
