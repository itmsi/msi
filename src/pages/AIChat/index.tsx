import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import { AIAssistantService } from "@/services/aiAssistantService";
import type { ChatMessage } from "@/types/aiAssistant";
import { Thread } from "@/components/assistant-ui/thread";
import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
  type ExternalStoreAdapter,
} from "@assistant-ui/react";
import { MdAdd, MdDelete, MdChat } from "react-icons/md";
import { IconAIAtomOrbit } from "@/icons";
import { io, type Socket } from "socket.io-client";

interface ThreadItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  sessionId?: string;
  createdAt: string;
  isLoadingHistory?: boolean;
}

export default function AIChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Refs for cancel/abort streaming
  const abortRef = useRef<AbortController | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ─── createNewThread must be defined BEFORE effects that use it ───
  const createNewThread = useCallback(() => {
    const newThread: ThreadItem = {
      id: `thread-${Date.now()}`,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  }, []);

  // Auto-create a new thread on mount
  const hasAutoCreated = useRef(false);
  useEffect(() => {
    if (!hasAutoCreated.current) {
      hasAutoCreated.current = true;
      createNewThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut: Ctrl+N / Cmd+N to create new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        createNewThread();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createNewThread]);

  // Cancel the current stream
  const handleCancel = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsSending(false);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // HISTORY LOADING — DISABLED (sidebar/history hidden for now)
  // Uncomment the block below to re-enable history loading from backend.
  // ─────────────────────────────────────────────────────────────
  // useEffect(() => {
  //   let cancelled = false;
  //   (async () => {
  //     try {
  //       let employeeId: string | undefined;
  //       try {
  //         const authUser = localStorage.getItem("auth_user");
  //         if (authUser) {
  //           const parsed = JSON.parse(authUser);
  //           employeeId = parsed.employee_id;
  //         }
  //       } catch {}
  //
  //       const response = await AIAssistantService.listHistoryByUser(employeeId);
  //       if (cancelled || !response.success) return;
  //       const sessions = response.data?.conversations || [];
  //       if (sessions.length === 0) return;
  //
  //       const loadedThreads: ThreadItem[] = sessions.map((s) => ({
  //         id: `session-${s.session_id}`,
  //         title: s.first_message
  //           ? s.first_message.length > 40
  //             ? s.first_message.slice(0, 40) + '...'
  //             : s.first_message
  //           : s.last_message_at
  //             ? `Chat ${new Date(s.last_message_at).toLocaleDateString("id-ID", {
  //                 day: "numeric",
  //                 month: "short",
  //                 hour: "2-digit",
  //                 minute: "2-digit",
  //               })}`
  //             : "Chat",
  //         messages: [],
  //         sessionId: s.session_id,
  //         createdAt: s.created_at,
  //         isLoadingHistory: false,
  //       }));
  //
  //       setThreads(loadedThreads);
  //     } catch {
  //     }
  //   })();
  //   return () => { cancelled = true; };
  // }, []);

  // Derive active thread messages
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId]
  );

  const threadMessages = activeThread?.messages || [];
  const isLoadingHistory = activeThread?.isLoadingHistory || false;

  // Convert ChatMessage to ThreadMessage for assistant-ui runtime
  const convertToThreadMessage = useCallback(
    (msg: ChatMessage, idx: number): any => {
      const isLast = idx === threadMessages.length - 1;
      return {
        id: `msg-${idx}`,
        role: msg.role === "user" ? "user" : "assistant",
        content: [{ type: "text" as const, text: msg.content }],
        createdAt: new Date(msg.timestamp),
        metadata: {},
        status: isLast && isSending
          ? { type: "running" as const }
          : { type: "complete" as const, reason: "stop" as const },
      };
    },
    [threadMessages.length, isSending]
  );

  const convertedMessages = useMemo(
    () => threadMessages.map(convertToThreadMessage),
    [threadMessages, convertToThreadMessage]
  );

  const selectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);

    setThreads((prev) => {
      const thread = prev.find((t) => t.id === threadId);
      if (thread?.sessionId && thread.messages.length === 0) {
        return prev.map((t) =>
          t.id === threadId ? { ...t, isLoadingHistory: true } : t
        );
      }
      return prev;
    });
  }, []);

  // Load history from backend when a thread with sessionId is selected
  useEffect(() => {
    const thread = threads.find((t) => t.id === activeThreadId);
    if (!thread?.sessionId || thread.messages.length > 0 || !thread.isLoadingHistory) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await AIAssistantService.getHistory(thread.sessionId!);
        if (cancelled) return;
        if (response.success && response.data?.conversationHistory) {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === activeThreadId
                ? {
                    ...t,
                    messages: response.data.conversationHistory,
                    isLoadingHistory: false,
                    title:
                      response.data.conversationHistory.length > 0
                        ? response.data.conversationHistory[0].content.slice(0, 40)
                        : t.title,
                  }
                : t
            )
          );
        } else {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === activeThreadId ? { ...t, isLoadingHistory: false } : t
            )
          );
        }
      } catch {
        if (!cancelled) {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === activeThreadId ? { ...t, isLoadingHistory: false } : t
            )
          );
        }
      }
    })();

    return () => { cancelled = true; };
  }, [activeThreadId, threads]);

  const deleteThread = useCallback(async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const thread = threads.find((t) => t.id === threadId);

    // Clear history on backend if thread has a sessionId
    if (thread?.sessionId) {
      try {
        await AIAssistantService.clearHistory(thread.sessionId);
      } catch {
        // Silently fail — thread is still removed from local state
      }
    }

    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (threadId === activeThreadId) {
      setActiveThreadId(null);
    }
  }, [threads, activeThreadId]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !activeThreadId) return;

      // Add user message immediately
      const userMessage: ChatMessage = {
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      // Add empty assistant message placeholder for streaming
      const assistantPlaceholder: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setIsSending(true);

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages: [...t.messages, userMessage, assistantPlaceholder] }
            : t
        )
      );

      try {
        let systemArray: string[] = [];
        try {
          const storedSystem = localStorage.getItem("auth_system");
          systemArray = storedSystem ? JSON.parse(storedSystem) : [];
        } catch {}

        let employeeId: string | undefined;
        try {
          const authUser = localStorage.getItem("auth_user");
          if (authUser) {
            const parsed = JSON.parse(authUser);
            employeeId = parsed.employee_id;
          }
        } catch {}

        const activeThreadSession = threads.find((t) => t.id === activeThreadId)?.sessionId;
        const token = localStorage.getItem("auth_token");

        // ─── Streaming via Socket.IO with HTTP fallback ─────────
        const SOCKET_BASE = import.meta.env.VITE_API_BASE_URL;
        const SOCKET_PATH = "/mosa/ai-assistant/websocket";
        const HTTP_URL =  `${import.meta.env.VITE_API_BASE_URL}/mosa/ai-assistant/chat/stream`;
        let accumulatedText = "";
        let newSessionId: string | undefined = activeThreadSession;

        // Set up abort controller for cancellation
        const abortController = new AbortController();
        abortRef.current = abortController;

        // Helper to update the assistant placeholder with accumulated text
        const updateStreamText = (text: string) => {
          flushSync(() => {
            setThreads((prev) =>
              prev.map((t) =>
                t.id === activeThreadId
                  ? {
                      ...t,
                      messages: t.messages.map((m, i) =>
                        i === t.messages.length - 1
                          ? { ...m, content: text }
                          : m
                      ),
                    }
                  : t
              )
            );
          });
        };

        // Helper to parse a 0:/2:/d:/3: line (server uses \r\n line endings)
        const parseStreamLine = (line: string): { type: 'text' | 'done' | 'error' | 'skip'; text?: string; sessionId?: string } => {
          // Strip \r from CRLF line endings so startsWith() matches correctly
          const clean = line.replace(/\r$/, '');
          if (clean.startsWith("0:")) {
            const raw = clean.slice(2).trim();
            let parsedText = raw;
            if (raw.startsWith('"') && raw.endsWith('"')) {
              try {
                parsedText = JSON.parse(raw);
              } catch { parsedText = raw.replace(/^"|"$/g, ""); }
            }
            return { type: 'text', text: String(parsedText) };
          }
          // 2: prefix carries internal tool call metadata — not for display
          if (clean.startsWith("2:")) {
            return { type: 'skip' };
          }
          if (clean.startsWith("d:")) {
            try {
              const doneData = JSON.parse(clean.slice(2).trim());
              return { type: 'done', sessionId: doneData.sessionId };
            } catch { return { type: 'done' }; }
          }
          if (clean.startsWith("3:")) {
            return { type: 'error' };
          }
          // Empty line or unknown — skip
          return { type: 'skip' };
        };

        // ── Try Socket.IO first ──
        const socket = await new Promise<Socket | null>((resolve) => {
          let settled = false;
          const s = io(SOCKET_BASE, {
            path: SOCKET_PATH,
            transports: ["websocket"],        // Skip long-polling, straight to WebSocket
            reconnection: false,               // One-shot per message
            timeout: 10000,                    // Connection timeout
          });

          const timeout = setTimeout(() => {
            if (!settled) {
              settled = true;
              s.disconnect();
              resolve(null);
            }
          }, 3000); // 3s connect timeout

          s.on("connect", () => {
            clearTimeout(timeout);
            if (settled) { s.disconnect(); return; }
            settled = true;
            socketRef.current = s;
            resolve(s);

            // Send message immediately via Socket.IO event
            s.emit("chat:send", {
              message: messageText,
              sessionId: activeThreadSession,
              system: systemArray,
              userId: employeeId,
              token,
            });
          });

          s.on("connect_error", () => {
            clearTimeout(timeout);
            if (!settled) { settled = true; resolve(null); }
          });

          s.on("disconnect", () => {
            clearTimeout(timeout);
            if (!settled) { settled = true; resolve(null); }
          });
        });

        if (socket) {
          // ── Socket.IO connected — stream via events ──
          await new Promise<void>((resolve, reject) => {
            let finished = false;

            // Listen for abort signal
            abortController.signal.addEventListener("abort", () => {
              if (!finished) {
                finished = true;
                socket.disconnect();
                socketRef.current = null;
                resolve();
              }
            });

            socket.on("chat:chunk", (data: { text: string }) => {
              if (abortController.signal.aborted) return;
              if (data.text) {
                accumulatedText += data.text;
                updateStreamText(accumulatedText);
              }
            });

            socket.on("chat:done", (data: { sessionId?: string }) => {
              if (data?.sessionId) newSessionId = data.sessionId;
              if (!finished) { finished = true; resolve(); }
              socketRef.current = null;
              socket.disconnect();
            });

            socket.on("chat:error", (data: { message?: string }) => {
              if (!finished) { finished = true; reject(new Error(data?.message || "Socket.IO stream error")); }
              socketRef.current = null;
              socket.disconnect();
            });

            socket.on("disconnect", (reason: string) => {
              if (!finished) {
                finished = true;
                if (reason !== "io client disconnect") {
                  reject(new Error(`Socket disconnected: ${reason}`));
                } else {
                  resolve();
                }
              }
            });
          });
        } else {
          // ── Socket.IO unavailable — fall back to HTTP streaming ──
          const response = await fetch(HTTP_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              message: messageText,
              sessionId: activeThreadSession,
              system: systemArray,
              userId: employeeId,
            }),
            signal: abortController.signal,
          });

          if (!response.ok || !response.body) throw new Error("HTTP stream request failed");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Check if cancelled
            if (abortController.signal.aborted) break;

            buffer += decoder.decode(value, { stream: true });

            // Normalize all line endings (\r\n, \r, \n) to just \n
            buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const lines = buffer.split("\n");
            // Keep the last (possibly incomplete) line in the buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
              const result = parseStreamLine(line);
              if (result.type === 'text' && result.text) {
                accumulatedText += result.text;
                updateStreamText(accumulatedText);
              } else if (result.type === 'done') {
                if (result.sessionId) newSessionId = result.sessionId;
                break;
              } else if (result.type === 'error') {
                throw new Error("Stream error from server");
              }
            }
          }
        }

        // Clear socket ref when done
        socketRef.current = null;
        abortRef.current = null;

        // Save sessionId and update title from streaming result
        const finalSessionId = newSessionId || activeThreadSession || `session_${employeeId || 'unknown'}_${Date.now()}`;
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== activeThreadId) return t;
            return {
              ...t,
              sessionId: finalSessionId,
              title: t.messages.length <= 2
                ? messageText.slice(0, 40)
                : t.title,
            };
          })
        );
      } catch {
        // On error, update the placeholder with error message
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? {
                  ...t,
                  messages: t.messages.map((m, i) =>
                    i === t.messages.length - 1 && m.content === ""
                      ? { ...m, content: "Maaf, terjadi kesalahan. Silakan coba lagi." }
                      : m
                  ),
                }
              : t
          )
        );
      } finally {
        setIsSending(false);
        socketRef.current = null;
        abortRef.current = null;
      }
    },
    [activeThreadId, threads]
  );

  // Runtime adapter for assistant-ui
  const handleNewMessage = useCallback(
    async (content: string) => {
      await handleSendMessage(content);
    },
    [handleSendMessage]
  );

  const adapter = useMemo<ExternalStoreAdapter>(
    () => ({
      messages: convertedMessages as any,
      isRunning: isSending || isLoadingHistory,
      onNew: async (message) => {
        const text =
          typeof message.content === "string"
            ? message.content
            : message.content
                .map((p) => (typeof p === "string" ? p : "text" in p ? p.text : ""))
                .join("");
        await handleNewMessage(text);
      },
    }),
    [convertedMessages, isSending, isLoadingHistory, handleNewMessage]
  );

  const runtime = useExternalStoreRuntime(adapter);

  return (
    <div className="h-full flex">
      {/* SIDEBAR — DISABLED (sidebar/history hidden for now) */}
      {/* Change `false` to `true` below to re-enable sidebar. */}
      {false && (
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } transition-all duration-300 overflow-hidden flex flex-col bg-gray-50 border-r border-gray-200 shrink-0`}
        >
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={createNewThread}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0253a5] hover:bg-[#003061] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <MdAdd className="w-4 h-4" />
              New Chat (Ctrl + M)
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No conversations yet</p>
            )}
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors group ${
                  thread.id === activeThreadId
                    ? "bg-[#0253a5] text-white"
                    : "hover:bg-gray-200 text-gray-700"
                }`}
              >
                <MdChat className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{thread.title}</span>
                <span
                  onClick={(e) => deleteThread(thread.id, e)}
                  className={`p-1 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${
                    thread.id === activeThreadId
                      ? "hover:bg-white/20 text-white"
                      : "hover:bg-gray-300 text-gray-500"
                  }`}
                >
                  <MdDelete className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-gray-50/50 to-white">
        {/* Header Bar */}
        <header className="h-18 shrink-0 flex items-center gap-3 px-4 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
          {/* Sidebar toggle — DISABLED (sidebar hidden for now) */}
          {/* Change `false` to `true` below to re-enable toggle. */}
          {false && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center">
              <IconAIAtomOrbit size={30} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-primary-bold text-sm text-gray-800 leading-tight">
                Mosa AI Assistant
              </span>
              <span className="text-[11px] text-gray-400 font-secondary leading-tight">
                {activeThread?.title || "Siap membantu Anda"}
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={createNewThread}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0253a5] hover:bg-[#003061] text-white text-xs font-secondary rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-[#0253a5]/25 active:scale-95"
              title="Mulai percakapan baru"
            >
              <MdAdd className="w-3.5 h-3.5" />
              New Chat (Ctrl + M)
            </button>
            <span className="px-2 py-0.5 bg-[#0253a5]/10 text-[#0253a5] text-[11px] font-secondary rounded-full border border-[#0253a5]/20">
              Online
            </span>
          </div>
        </header>

        {/* Thread */}
        <div className="flex-1 min-h-0">
          {activeThreadId ? (
            <AssistantRuntimeProvider runtime={runtime}>
              <Thread onSendMessage={handleSendMessage} isSending={isSending} onCancel={handleCancel} />
            </AssistantRuntimeProvider>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5">
                <IconAIAtomOrbit size={100} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-secondary mb-3">Pilih percakapan atau mulai chat baru</p>
              <button
                onClick={createNewThread}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0253a5] hover:bg-[#003061] text-white text-sm font-secondary rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#0253a5]/25 active:scale-95"
              >
                <MdAdd className="w-4 h-4" />
                Mulai Percakapan Baru
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
