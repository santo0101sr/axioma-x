"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  Check,
  Copy,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "¿Cómo funciona Axioma-X?",
  "Redacta un seguimiento por WhatsApp para una cotización",
  "Sugiere notas y condiciones de pago profesionales",
  "Dame tips para cerrar más cotizaciones",
];

export function GroqChatbox() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Hide on client-facing shared quote portal (/q)
  if (pathname?.startsWith("/q")) {
    return null;
  }

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textOverride) setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo obtener respuesta de Groq.");
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error de conexión al consultar el asistente.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  async function handleCopy(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard errors
    }
  }

  function handleClear() {
    setMessages([]);
    setError(null);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Asistente IA de Axioma-X con Groq"
          className="mb-3 flex h-[540px] max-h-[80vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b1120]/95 shadow-2xl shadow-black/60 backdrop-blur-xl sm:w-[400px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-500/20 ring-1 ring-blue-400/30">
                <Sparkles className="h-4 w-4 text-sky-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white">Axioma AI</h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
                    <Zap className="h-2.5 w-2.5" />
                    Groq
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Asistente comercial · Llama 3.3 70B
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  title="Limpiar conversación"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Cerrar chat"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                    <Bot className="h-4 w-4" />
                    ¡Hola! Soy tu asistente con Groq
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    Puedo ayudarte a redactar mensajes de WhatsApp para tus
                    clientes, mejorar tus notas de cotización o resolver dudas
                    sobre Axioma-X al instante.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Sugerencias rápidas
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessage(prompt)}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`group relative max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        isUser
                          ? "rounded-br-sm bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "rounded-bl-sm border border-white/10 bg-white/[0.05] text-slate-200"
                      }`}
                    >
                      {msg.content}

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => void handleCopy(msg.id, msg.content)}
                          title="Copiar respuesta"
                          className="mt-2 flex items-center gap-1 text-[10px] font-medium text-slate-400 transition hover:text-sky-300"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs text-slate-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                  <span>Pensando con Groq...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="border-t border-white/10 bg-slate-950/80 p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/30">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta..."
                disabled={isLoading}
                className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Enviar mensaje"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-slate-500">
              Enter para enviar · Shift+Enter nueva línea
            </p>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Cerrar asistente Groq" : "Abrir asistente Groq"}
        className="group relative flex items-center gap-2 rounded-full border border-blue-400/30 bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-blue-600/30 transition hover:scale-[1.03] hover:shadow-blue-500/50 active:scale-[0.98]"
      >
        {isOpen ? (
          <>
            <X className="h-4 w-4" />
            <span>Cerrar</span>
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Chat IA</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
              Groq
            </span>
          </>
        )}
      </button>
    </div>
  );
}
