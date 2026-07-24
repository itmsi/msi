"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { MdSend, MdStop, MdPerson, MdContentCopy } from "react-icons/md";
import { IconAIAtomOrbit } from "@/icons";
import { MarkdownText } from "./markdown-text";
import { type FC, useRef, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Context Tags ────────────────────────────────────────────────────────────

interface ContextTagDef {
  id: string;
  label: string;
  icon?: string;
}

// Mapping from auth_system values (as stored in localStorage) to context tag definitions
const AUTH_SYSTEM_TO_TAG: Record<string, ContextTagDef> = {
  "CRM":              { id: "crm",           label: "CRM",              icon: "👥" },
  "Quotation ITI":    { id: "quotation",     label: "Quotation",        icon: "📄" },
  "AI":               { id: "ai",            label: "AI",               icon: "🤖" },
  "User Management":  { id: "user-management", label: "User Management", icon: "👥" },
  "Netsuite":         { id: "netsuite",      label: "Netsuite",         icon: "📋" },
  "ROA ROE Calculate": { id: "calculator",   label: "Calculator",       icon: "🔢" },
  "Power BI":         { id: "dashboard",     label: "Dashboard",        icon: "📊" },
  "HRM":              { id: "hr",            label: "HRM",              icon: "👤" },
  "Purchase Order":   { id: "po",            label: "Purchase Order",    icon: "📦" },
  "Sales Order":      { id: "sales-order",   label: "Sales Order",      icon: "📋" },
  "Territory/IUP":    { id: "territory",     label: "Territory/IUP",     icon: "🗺️" },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface ThreadProps {
  /** Called when a suggested prompt is clicked */
  onSendMessage?: (text: string) => void;
  /** Whether the AI is currently streaming a response */
  isSending?: boolean;
  /** Called when the user wants to cancel/stop the stream */
  onCancel?: () => void;
  /** Currently selected context tags */
  selectedTags?: string[];
  /** Called when tags are toggled */
  onTagsChange?: (tags: string[]) => void;
  /** Incremented after each send to trigger tag collapse */
  sendCount?: number;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function ArrowDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

const TypingIndicator: FC = () => (
  <div className="flex items-center gap-2 px-1 py-0.5">
    <div className="flex gap-1">
      <motion.span
        className="w-1.5 h-1.5 bg-[#0253a5] rounded-full"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="w-1.5 h-1.5 bg-[#0253a5] rounded-full"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        className="w-1.5 h-1.5 bg-[#0253a5] rounded-full"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
      />
    </div>
    <span className="text-[11px] text-gray-400 font-secondary">Mosa sedang mengetik...</span>
  </div>
);

// ─── Pulsing cursor (for streaming) ───────────────────────────────────────────

const StreamingCursor: FC = () => (
  <motion.span
    className="inline-block w-[3px] h-[14px] bg-[#0253a5] ml-0.5 rounded-full align-middle"
    animate={{ opacity: [1, 0] }}
    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
  />
);

// ─── Typing Text (progressive reveal) ────────────────────────────────────────
// Smoothly reveals text character-by-character during streaming.
// Uses requestAnimationFrame for efficient rendering.

const TypingText: FC<{ content: string; isRunning: boolean }> = ({ content, isRunning }) => {
  const [visibleLen, setVisibleLen] = useState(0);
  const contentRef = useRef(content);
  const lastTimeRef = useRef(0);
  const SPEED = 18; // ms per character — lower = faster typing

  // Reset when a new message starts (content gets shorter or empty)
  useEffect(() => {
    if (content.length < contentRef.current.length) {
      setVisibleLen(0);
    }
    contentRef.current = content;
  }, [content]);

  // Progressive reveal — runs during streaming
  useEffect(() => {
    if (!isRunning) {
      setVisibleLen(content.length);
      return;
    }

    // Don't restart if already fully revealed
    if (visibleLen >= content.length && content.length > 0) return;

    lastTimeRef.current = 0;
    let rafId: number;
    let currentLen = visibleLen;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= SPEED) {
        lastTimeRef.current = timestamp;
        currentLen = Math.min(currentLen + 1, content.length);
        setVisibleLen(currentLen);
      }

      if (currentLen < content.length) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, content]);

  const displayText = content.slice(0, Math.min(visibleLen, content.length));

  return (
    <>
      <MarkdownText content={displayText} />
      {isRunning && <StreamingCursor />}
    </>
  );
};

// ─── Suggested Prompts ───────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "Tampilkan 5 quotation terbaru",
  "Berapa jumlah quotation keseluruhan?",
  "Cari quotation untuk customer tertentu",
  "Apa yang bisa kamu bantu?",
];

// ─── Generate tags from auth_system localStorage ───────────────────────────

function getAvailableTags(): ContextTagDef[] {
  try {
    const storedSystem = localStorage.getItem('auth_system');
    if (!storedSystem) {
      // Fallback: show all known tags
      return Object.values(AUTH_SYSTEM_TO_TAG);
    }
    const systemArray: string[] = JSON.parse(storedSystem);
    if (!Array.isArray(systemArray) || systemArray.length === 0) {
      return Object.values(AUTH_SYSTEM_TO_TAG);
    }

    const tags: ContextTagDef[] = [];
    const seen = new Set<string>();

    for (const sys of systemArray) {
      const mapped = AUTH_SYSTEM_TO_TAG[sys];
      if (mapped && !seen.has(mapped.id)) {
        tags.push(mapped);
        seen.add(mapped.id);
      } else if (!mapped) {
        // For unknown auth_system values, create a default tag
        const fallbackId = sys.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!seen.has(fallbackId)) {
          tags.push({ id: fallbackId, label: sys, icon: '🔧' });
          seen.add(fallbackId);
        }
      }
    }

    return tags;
  } catch {
    return Object.values(AUTH_SYSTEM_TO_TAG);
  }
}

// ─── Main Thread ─────────────────────────────────────────────────────────────

export const Thread: FC<ThreadProps> = ({ onSendMessage, isSending, onCancel, selectedTags, onTagsChange, sendCount }) => {
  const handleToggleTag = useCallback((tagId: string) => {
    const current = selectedTags ?? [];
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    onTagsChange?.(next);
  }, [selectedTags, onTagsChange]);

  const availableTags = useMemo(() => getAvailableTags(), []);

  return (
    <ThreadPrimitive.Root className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50/50">
      <ThreadPrimitive.Viewport className="flex flex-1 flex-col overflow-y-auto scroll-smooth">
        <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-4 flex-1 flex flex-col">
          <ThreadPrimitive.Empty>
            <WelcomeScreen onSendMessage={onSendMessage} />
          </ThreadPrimitive.Empty>

          <ThreadPrimitive.Messages>
            {() => <ThreadMessage />}
          </ThreadPrimitive.Messages>

          <div className="mt-auto" />
        </div>

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto w-full max-w-3xl px-4 pb-4">
          <div className="relative">
            <ThreadScrollToBottom />
            <Composer isSending={isSending} onCancel={onCancel} />
            <ContextTags
              tags={availableTags}
              selected={selectedTags ?? []}
              onToggle={handleToggleTag}
              disabled={isSending}
              sendCount={sendCount}
            />
          </div>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

// ─── Welcome Screen ──────────────────────────────────────────────────────────

const WelcomeScreen: FC<{ onSendMessage?: (text: string) => void }> = ({ onSendMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center flex-1 py-16 text-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center 0 mb-6"
      >
        <IconAIAtomOrbit size={100} className="text-white" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-primary-bold text-gray-800 mb-2"
      >
        Halo! Ada yang bisa Mosa bantu?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-gray-500 font-secondary mb-8 max-w-md"
      >
        Asisten virtual MSI yang siap membantu Anda dengan data quotation, CRM, HR, dan module lainnya.
      </motion.p>

      {/* Suggested Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg"
      >
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSendMessage?.(prompt)}
            className="text-left px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-[#0253a5]/30 hover:bg-[#0253a5]/5 
                       text-sm text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="font-secondary">{prompt}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-6 mt-10 text-xs text-gray-400 font-secondary"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-green-400" />
          Data Real-time
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-blue-400" />
          Multi-module
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-purple-400" />
          Streaming
        </span>
      </motion.div>
    </motion.div>
  );
};

// ─── Scroll to Bottom ────────────────────────────────────────────────────────

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <button className="absolute -top-12 right-0 z-10 flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 hover:shadow-lg disabled:invisible transition-all duration-200 hover:-translate-y-0.5">
        <ArrowDownIcon />
      </button>
    </ThreadPrimitive.ScrollToBottom>
  );
};

// ─── Thread Message ──────────────────────────────────────────────────────────

const ThreadMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);

  if (role === "user") return <UserMessage />;
  return <AssistantMessage />;
};

// ─── User Message ────────────────────────────────────────────────────────────

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root data-role="user" className="flex justify-end mb-4">
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex items-end gap-2 max-w-[80%]"
      >
        {/* Message bubble */}
        <div className="bg-[#0253a5] text-white rounded-2xl rounded-br-md px-4 py-2.5 shadow-md shadow-[#0253a5]/15 min-w-0 overflow-x-auto max-w-full">
          <MessagePrimitive.Content>
            {({ part }) => {
              if (part.type === "text")
                return <p className="text-sm font-secondary leading-relaxed">{part.text}</p>;
              return null;
            }}
          </MessagePrimitive.Content>
        </div>
        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shrink-0 shadow-sm">
          <MdPerson className="w-4 h-4 text-white" />
        </div>
      </motion.div>
    </MessagePrimitive.Root>
  );
};

// ─── Bubble Content (scrollable with overflow indicator) ────────────────────

const BubbleContent: FC<{ children: ReactNode }> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (el) {
        setIsOverflowing(el.scrollWidth > el.clientWidth + 2); // +2 for tolerance
      }
    };

    checkOverflow();

    // Re-check on resize
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);

    return () => observer.disconnect();
  }, [children]);

  return (
    <div className="relative">
      {/* Scrollable container with custom scrollbar */}
      <div
        ref={scrollRef}
        className="overflow-x-auto
          [&::-webkit-scrollbar]:h-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:hover:bg-gray-400
        "
      >
        {children}
      </div>

      {/* Scroll shadow + arrow — only shows when content overflows */}
      {isOverflowing && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/70 to-transparent" />
          <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Assistant Message ───────────────────────────────────────────────────────

const AssistantMessage: FC = () => {
  const isRunning = useAuiState((s) => s.message.status?.type === "running");

  return (
    <MessagePrimitive.Root data-role="assistant" className="flex justify-start mb-4 group">
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex items-start gap-2 max-w-[85%]"
      >
        {/* Mosa Avatar */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1">
          <IconAIAtomOrbit size={40} className="text-white" />
        </div>

        {/* Message bubble */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-0 py-3 shadow-sm min-w-0 max-w-full">
          <BubbleContent>
            <MessagePrimitive.Content>
              {({ part }) => {
                if (part.type !== "text") return null;
                const text = part.text;
                return (
                  <>
                    <div className="px-4">
                      <TypingText content={text} isRunning={isRunning} />
                    </div>
                    <div className="flex items-center gap-1 px-4 mt-2">
                      {isRunning ? (
                        <TypingIndicator />
                      ) : (
                        <button
                          onClick={() => navigator.clipboard.writeText(text)}
                          className="group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200/60 rounded-md text-gray-400 hover:text-gray-600"
                          title="Salin"
                        >
                          <MdContentCopy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </>
                );
              }}
            </MessagePrimitive.Content>
          </BubbleContent>
        </div>
      </motion.div>
    </MessagePrimitive.Root>
  );
};

// ─── Composer (Input Area) ───────────────────────────────────────────────────

interface ComposerProps {
  isSending?: boolean;
  onCancel?: () => void;
}

// ─── Context Tags Component ───────────────────────────────────────────────────

interface ContextTagsProps {
  tags: ContextTagDef[];
  selected: string[];
  onToggle: (tagId: string) => void;
  disabled?: boolean;
  sendCount?: number;
}

const ContextTags: FC<ContextTagsProps> = ({ tags, selected, onToggle, disabled, sendCount = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const prevSendCount = useRef(sendCount);

  // Collapse unselected tags after a message is sent
  useEffect(() => {
    if (sendCount > prevSendCount.current && selected.length > 0) {
      setIsExpanded(false);
    }
    prevSendCount.current = sendCount;
  }, [sendCount, selected.length]);

  if (tags.length === 0) return null;

  const hasSelection = selected.length > 0;
  const hiddenTags = tags.filter((t) => !selected.includes(t.id));
  const hiddenCount = hiddenTags.length;

  // Render a single tag button
  const renderTag = (tag: ContextTagDef) => {
    const isActive = selected.includes(tag.id);
    return (
      <motion.button
        key={tag.id}
        type="button"
        disabled={disabled}
        onClick={() => onToggle(tag.id)}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-secondary leading-none transition-colors duration-200 ${
          isActive
            ? "bg-[#0253a5] text-white shadow-sm shadow-[#0253a5]/20 ring-1 ring-[#0253a5]/30"
            : "bg-gray-100/80 text-gray-500 hover:text-gray-700 hover:bg-gray-200/80 ring-1 ring-gray-200/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="text-sm">{tag.icon}</span>
        <span>{tag.label}</span>
        {isActive && (
          <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </motion.button>
    );
  };

  // Visible tags: if collapsed with selection, show only selected tags + expand button
  const visibleTags = hasSelection && !isExpanded
    ? tags.filter((t) => selected.includes(t.id))
    : tags;

  return (
    <div className="flex flex-wrap gap-2 px-0.5 pt-3 pb-0 items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleTags.map((tag) => (
          <motion.div
            key={tag.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {renderTag(tag)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Expand / Collapse button — only show when there's a selection */}
      {hasSelection && hiddenCount > 0 && (
        <motion.button
          type="button"
          disabled={disabled}
          onClick={() => setIsExpanded(!isExpanded)}
          layout
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-secondary leading-none bg-gray-100/80 text-gray-500 hover:text-gray-700 hover:bg-gray-200/80 ring-1 ring-gray-200/50 transition-colors duration-200 cursor-pointer"
        >
          {isExpanded ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-[11px] text-gray-400">Sembunyikan</span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium">+{hiddenCount}</span>
              <span className="text-[11px] text-gray-400">lainnya</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};

const Composer: FC<ComposerProps> = ({ isSending, onCancel }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <ComposerPrimitive.Root className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 p-2 transition-all duration-200 focus-within:border-[#0253a5]/40 focus-within:shadow-[#0253a5]/10 focus-within:shadow-lg">
      <div className="flex items-end gap-2">
        <ComposerPrimitive.Input
          ref={inputRef}
          placeholder="Ketik pesan ke Mosa..."
          className="flex-1 bg-transparent outline-none resize-none text-sm text-gray-700 placeholder:text-gray-400 placeholder:font-secondary max-h-[150px] min-h-[44px] py-2.5 px-3 leading-relaxed"
          rows={1}
          autoFocus
          disabled={isSending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const form = (e.target as HTMLElement).closest("form");
              form?.requestSubmit();
            }
          }}
        />
        <div className="flex items-center gap-1.5 pr-1 pb-1">
          {isSending ? (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md hover:shadow-red-500/25 shrink-0"
              title="Hentikan streaming"
            >
              <MdStop className="w-4 h-4" />
            </button>
          ) : (
            <ComposerPrimitive.Send asChild>
              <button className="flex items-center justify-center w-9 h-9 bg-[#0253a5] hover:bg-[#003061] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md hover:shadow-[#0253a5]/25 shrink-0">
                <MdSend className="w-4 h-4" />
              </button>
            </ComposerPrimitive.Send>
          )}
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
};
