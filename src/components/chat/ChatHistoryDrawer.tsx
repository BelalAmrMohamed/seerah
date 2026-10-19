"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pin, Trash2, Edit2, Download, FileText, Printer, Check, X, MessageSquare, Sparkles } from "lucide-react";
import { useChatStore, type ChatSession } from "@/lib/chatStore";
import { downloadSessionMarkdown, printSessionPdf } from "@/lib/chatExport";
import { toast } from "sonner";

interface ChatHistoryDrawerProps {
  currentStationId?: number;
}

export default function ChatHistoryDrawer({ currentStationId }: ChatHistoryDrawerProps) {
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const sidebarOpen = useChatStore((s) => s.sidebarOpen);
  const setSidebarOpen = useChatStore((s) => s.setSidebarOpen);
  const setActiveSessionId = useChatStore((s) => s.setActiveSessionId);
  const createNewSession = useChatStore((s) => s.createNewSession);
  const deleteSession = useChatStore((s) => s.deleteSession);
  const togglePinSession = useChatStore((s) => s.togglePinSession);
  const renameSession = useChatStore((s) => s.renameSession);
  const clearAllSessions = useChatStore((s) => s.clearAllSessions);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [openExportMenuId, setOpenExportMenuId] = useState<string | null>(null);

  // Separate pinned and unpinned sessions
  const pinnedSessions = sessions.filter((s) => s.pinned);
  const recentSessions = sessions.filter((s) => !s.pinned);

  const handleStartNewChat = () => {
    const id = createNewSession(currentStationId);
    toast.success("تم بدء محادثة جديدة");
  };

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      renameSession(id, editTitle.trim());
      toast.success("تم تحديث عنوان المحادثة");
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id);
    toast.success("تم حذف المحادثة");
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinSession(id);
  };

  const handleExportMd = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadSessionMarkdown(session);
    setOpenExportMenuId(null);
    toast.success("تم تنزيل ملف Markdown");
  };

  const handleExportPdf = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    printSessionPdf(session);
    setOpenExportMenuId(null);
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <div className="absolute inset-0 z-40 flex overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative ms-auto flex h-full w-[min(88vw,20rem)] flex-col border-s border-[color:var(--line)] bg-[color:var(--solid)] shadow-2xl z-10 select-none"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--line)] p-4 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} style={{ color: "var(--accent)" }} />
                <span className="font-ui text-sm font-semibold text-[color:var(--ink)]">سجل المحادثات</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-[color:var(--muted)] hover:bg-[color:var(--line)] hover:text-[color:var(--ink)] transition-colors cursor-pointer"
                aria-label="إغلاق السجل"
              >
                <X size={16} />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-3 shrink-0">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 border border-[color:var(--line)] bg-[color:var(--panel)] font-ui text-xs font-medium text-[color:var(--accent)] hover:border-[color:var(--accent)] transition-all cursor-pointer shadow-sm"
              >
                <Plus size={15} />
                <span>محادثة جديدة</span>
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 min-h-0 overflow-y-auto px-2 space-y-4" data-lenis-prevent>
              {/* Pinned Sessions */}
              {pinnedSessions.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent)] px-3 mb-1 block">
                    المثبتة
                  </span>
                  <div className="space-y-1">
                    {pinnedSessions.map((ses) => renderSessionItem(ses))}
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              <div>
                {pinnedSessions.length > 0 && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted)] px-3 mb-1 block">
                    الأخيرة
                  </span>
                )}
                {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <Sparkles size={24} className="mx-auto mb-2 text-[color:var(--muted)] opacity-50" />
                    <p className="text-xs text-[color:var(--muted)] font-ui">لا توجد محادثات سابقة</p>
                    <p className="text-[11px] text-[color:var(--muted)] mt-1 opacity-80">ابدأ بطرح سؤال لحفظ السجل</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentSessions.map((ses) => renderSessionItem(ses))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            {sessions.length > 0 && (
              <div className="border-t border-[color:var(--line)] p-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من رغبتك في مسح سجل المحادثات بالكامل؟")) {
                      clearAllSessions();
                      toast.success("تم مسح السجل بالكامل");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-[11px] font-ui text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>مسح السجل بالكامل</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  function renderSessionItem(ses: ChatSession) {
    const isActive = ses.id === activeSessionId;
    const isEditingThis = editingId === ses.id;
    const isExportMenuOpen = openExportMenuId === ses.id;

    return (
      <div
        key={ses.id}
        onClick={() => {
          if (!isEditingThis) {
            setActiveSessionId(ses.id);
            setSidebarOpen(false);
          }
        }}
        className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-ui transition-all cursor-pointer ${
          isActive
            ? "bg-[color:color-mix(in_srgb,var(--accent)_15%,var(--panel))] text-[color:var(--accent)] font-medium"
            : "text-[color:var(--ink)] hover:bg-[color:var(--panel)]"
        }`}
      >
        {isEditingThis ? (
          <form onSubmit={(e) => handleSaveRename(ses.id, e)} className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 rounded border border-[color:var(--accent)] bg-[color:var(--solid)] px-1.5 py-0.5 text-xs outline-none text-[color:var(--ink)]"
              autoFocus
            />
            <button type="submit" className="p-0.5 text-emerald-400 hover:opacity-80">
              <Check size={13} />
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="p-0.5 text-[color:var(--muted)] hover:text-[color:var(--ink)]">
              <X size={13} />
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {ses.pinned && <Pin size={11} className="text-[color:var(--accent)] shrink-0 fill-[color:var(--accent)]" />}
              <span className="truncate">{ses.title}</span>
            </div>

            {/* Quick Actions (Hover or Active) */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
              {/* Pin/Unpin */}
              <button
                type="button"
                onClick={(e) => handleTogglePin(ses.id, e)}
                className={`p-1 rounded hover:bg-[color:var(--line)] transition-colors ${
                  ses.pinned ? "text-[color:var(--accent)]" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                }`}
                title={ses.pinned ? "إلغاء التثبيت" : "تثبيت في الأعلى"}
              >
                <Pin size={12} className={ses.pinned ? "fill-current" : ""} />
              </button>

              {/* Rename */}
              <button
                type="button"
                onClick={(e) => handleStartRename(ses, e)}
                className="p-1 rounded text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)] transition-colors"
                title="إعادة تسمية"
              >
                <Edit2 size={12} />
              </button>

              {/* Export dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenExportMenuId(isExportMenuOpen ? null : ses.id);
                  }}
                  className="p-1 rounded text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--line)] transition-colors"
                  title="تصدير المحادثة"
                >
                  <Download size={12} />
                </button>

                {isExportMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute end-0 top-full mt-1 w-32 rounded-xl border border-[color:var(--line)] bg-[color:var(--solid)] p-1 shadow-xl z-30 space-y-0.5"
                  >
                    <button
                      type="button"
                      onClick={(e) => handleExportMd(ses, e)}
                      className="w-full flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-start hover:bg-[color:var(--panel)] text-[color:var(--ink)]"
                    >
                      <FileText size={12} />
                      <span>ملف Markdown</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleExportPdf(ses, e)}
                      className="w-full flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-start hover:bg-[color:var(--panel)] text-[color:var(--ink)]"
                    >
                      <Printer size={12} />
                      <span>طباعة / PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={(e) => handleDelete(ses.id, e)}
                className="p-1 rounded text-[color:var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="حذف المحادثة"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
}
