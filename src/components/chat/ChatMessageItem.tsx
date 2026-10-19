"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Volume2, VolumeX, Edit3, ChevronRight, ChevronLeft, Sparkles, User, CornerDownLeft } from "lucide-react";
import { toast } from "sonner";
import MarkdownContent from "./MarkdownContent";
import { speakText, stopSpeaking } from "@/lib/speech";
import { type ChatMessage, type ChatSession, getMessageSiblings, useChatStore } from "@/lib/chatStore";

interface ChatMessageItemProps {
  session: ChatSession;
  message: ChatMessage;
  onEditSubmit: (messageId: string, newContent: string) => void;
  isStreaming?: boolean;
}

export default function ChatMessageItem({
  session,
  message,
  onEditSubmit,
  isStreaming = false,
}: ChatMessageItemProps) {
  const switchBranch = useChatStore((s) => s.switchBranch);

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const isUser = message.role === "user";

  // Branch navigation info
  const { siblings, currentIndex } = getMessageSiblings(session, message.id);
  const hasMultipleBranches = siblings.length > 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      toast.success("تم نسخ النص إلى الحافظة");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(message.content, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => {
          setIsSpeaking(false);
          toast.error("تعذر تشغيل الصوت في المتصفح");
        },
      });
    }
  };

  const handleBranchPrev = () => {
    if (currentIndex > 0) {
      stopSpeaking();
      switchBranch(session.id, siblings[currentIndex - 1]);
    }
  };

  const handleBranchNext = () => {
    if (currentIndex < siblings.length - 1) {
      stopSpeaking();
      switchBranch(session.id, siblings[currentIndex + 1]);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || editText.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    onEditSubmit(message.id, editText.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`group relative flex flex-col gap-1.5 ${isUser ? "items-start" : "items-start w-full"}`}
    >
      {/* Header meta line */}
      <div className={`flex items-center gap-2 text-[11px] font-ui text-[color:var(--muted)] px-1 ${isUser ? "ms-auto" : ""}`}>
        {isUser ? (
          <div className="flex items-center gap-1.5 flex-row-reverse">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[color:var(--panel)] border border-[color:var(--line)]">
              <User size={12} style={{ color: "var(--accent)" }} />
            </span>
            <span className="font-medium text-[color:var(--ink)]">أنت</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_18%,transparent)]">
              <Sparkles size={12} style={{ color: "var(--accent)" }} />
            </span>
            <span className="font-medium text-[color:var(--accent)]">المساعد الذكي</span>
          </div>
        )}

        {/* Branch Switcher (< 1 / 2 >) */}
        {hasMultipleBranches && (
          <div className="flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] px-1.5 py-0.5 text-[10px]">
            <button
              type="button"
              onClick={handleBranchPrev}
              disabled={currentIndex === 0}
              className="p-0.5 text-[color:var(--muted)] hover:text-[color:var(--ink)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="الفرع السابق"
            >
              <ChevronRight size={12} />
            </button>
            <span className="font-mono">
              {currentIndex + 1} / {siblings.length}
            </span>
            <button
              type="button"
              onClick={handleBranchNext}
              disabled={currentIndex === siblings.length - 1}
              className="p-0.5 text-[color:var(--muted)] hover:text-[color:var(--ink)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="الفرع التالي"
            >
              <ChevronLeft size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Bubble Content */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="w-full max-w-xl rounded-2xl border border-[color:var(--accent)] bg-[color:var(--panel)] p-3 shadow-lg">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--solid)] p-2.5 font-ui text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--accent)] resize-none"
            rows={3}
            autoFocus
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditText(message.content);
                setIsEditing(false);
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-ui text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-ui font-medium bg-[color:var(--accent)] text-[color:var(--bg)] hover:opacity-90"
            >
              <CornerDownLeft size={12} />
              <span>حفظ وتحديث</span>
            </button>
          </div>
        </form>
      ) : (
        <div
          className={`relative rounded-2xl px-4 py-3 border transition-all ${
            isUser
              ? "ms-auto max-w-[88%] bg-[color:color-mix(in_srgb,var(--accent)_12%,var(--panel))] border-[color:color-mix(in_srgb,var(--accent)_28%,transparent)] text-[color:var(--ink)]"
              : "w-full max-w-full bg-[color:var(--panel)] border-[color:var(--line)] text-[color:var(--ink)] shadow-sm"
          }`}
        >
          <MarkdownContent content={message.content} role={message.role} />
        </div>
      )}

      {/* Action Toolbar */}
      {!isEditing && (
        <div className={`flex items-center gap-1 text-xs text-[color:var(--muted)] px-1 ${isUser ? "ms-auto" : ""}`}>
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md p-1 hover:bg-[color:var(--line)] hover:text-[color:var(--ink)] transition-colors cursor-pointer"
            title="نسخ النص"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span className="text-[10px] hidden sm:inline">{copied ? "تم النسخ" : "نسخ"}</span>
          </button>

          {/* Read Aloud Button */}
          <button
            type="button"
            onClick={handleToggleSpeak}
            className={`flex items-center gap-1 rounded-md p-1 transition-colors cursor-pointer ${
              isSpeaking ? "text-[color:var(--accent)] bg-[color:color-mix(in_srgb,var(--accent)_15%,transparent)] font-semibold" : "hover:bg-[color:var(--line)] hover:text-[color:var(--ink)]"
            }`}
            title={isSpeaking ? "إيقاف القراءة" : "قراءة صوتية"}
          >
            {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span className="text-[10px] hidden sm:inline">{isSpeaking ? "إيقاف" : "استماع"}</span>
          </button>

          {/* Edit Prompt Button (Users only) */}
          {isUser && (
            <button
              type="button"
              onClick={() => {
                setEditText(message.content);
                setIsEditing(true);
              }}
              className="flex items-center gap-1 rounded-md p-1 hover:bg-[color:var(--line)] hover:text-[color:var(--ink)] transition-colors cursor-pointer"
              title="تعديل السؤال"
            >
              <Edit3 size={13} />
              <span className="text-[10px] hidden sm:inline">تعديل</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
