"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Check,
  Copy,
  Loader2,
  Send,
  Trash2,
  X,
  Zap,
} from "lucide-react";

function AxiomaMarkIcon({
  className = "h-5 w-5",
  accentClassName = "text-sky-200",
}: {
  className?: string;
  accentClassName?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer geometric "A" frame matching the Axioma-X brand mark */}
      <path
        d="M12.6 4.5C13.1 3.55 14.05 3 15.1 3H16.9C17.95 3 18.9 3.55 19.4 4.5L28.4 25.5C28.85 26.55 28.08 27.7 26.95 27.7H23.2C22.4 27.7 21.68 27.22 21.38 26.48L16 12.8L10.62 26.48C10.32 27.22 9.6 27.7 8.8 27.7H5.05C3.92 27.7 3.15 26.55 3.6 25.5L12.6 4.5Z"
        fill="currentColor"
      />
      {/* Interlocking "X" crossbar */}
      <path
        d="M11.6 18.2L14.2 18.2L16 20.65L17.8 18.2L20.4 18.2L17.45 22.15L20.9 26.8C21.15 27.15 20.9 27.7 20.45 27.7H17.9L16 25.05L14.1 27.7H11.55C11.1 27.7 10.85 27.15 11.1 26.8L14.55 22.15L11.6 18.2Z"
        fill="currentColor"
        className={accentClassName}
      />
    </svg>
  );
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS_ES = [
  "¿Cómo funciona Axioma-X?",
  "Redacta un seguimiento por WhatsApp para una cotización",
  "Sugiere notas y condiciones de pago profesionales",
  "Dame tips para cerrar más cotizaciones",
];

const QUICK_PROMPTS_EN = [
  "How does Axioma-X work?",
  "Draft a WhatsApp follow-up message for a quote",
  "Suggest professional payment terms and notes",
  "Give me tips to close more quotes",
];

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function GroqChatbox() {
  const { isEn } = useLanguage();
  const quickPrompts = isEn ? QUICK_PROMPTS_EN : QUICK_PROMPTS_ES;
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
        throw new Error(data?.error || "No se pudo obtener respuesta del asistente.");
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
          aria-label="Asistente IA de Axioma-X"
          className="mb-3 flex h-[540px] max-h-[80vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-[#f8fafc]/95 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-white/15 dark:bg-[#0b1120]/95 dark:shadow-black/60 sm:w-[400px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-100/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl shadow-md shadow-blue-600/20 ring-1 ring-blue-400/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/axioma-ai-icon.png"
                  alt="Axioma AI"
                  className="h-full w-full scale-[1.04] object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Axioma AI</h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-700 dark:border-sky-400/25 dark:bg-sky-500/10 dark:text-sky-300">
                    <Zap className="h-2.5 w-2.5" />
                    IA
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isEn ? "Smart commercial assistant" : "Asistente comercial inteligente"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  title={isEn ? "Clear conversation" : "Limpiar conversación"}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={isEn ? "Close chat" : "Cerrar chat"}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-sky-300">
                    <AxiomaMarkIcon
                      className="h-4 w-4 text-blue-600 dark:text-blue-400"
                      accentClassName="text-sky-500 dark:text-sky-200"
                    />
                    {isEn ? "Hi! I'm Axioma AI" : "¡Hola! Soy Axioma AI"}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {isEn
                      ? "I can help you draft WhatsApp messages for your clients, improve your quote notes, or answer questions about Axioma-X instantly."
                      : "Puedo ayudarte a redactar mensajes de WhatsApp para tus clientes, mejorar tus notas de cotización o resolver dudas sobre Axioma-X al instante."}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {isEn ? "Quick suggestions" : "Sugerencias rápidas"}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessage(prompt)}
                        className="rounded-xl border border-slate-200/90 bg-white/75 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-blue-400/50 hover:bg-blue-50 hover:text-blue-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-white"
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
                          : "rounded-bl-sm border border-slate-200/90 bg-white text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:shadow-none"
                      }`}
                    >
                      {isUser ? msg.content : renderFormattedText(msg.content)}

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => void handleCopy(msg.id, msg.content)}
                          title="Copiar respuesta"
                          className="mt-2 flex items-center gap-1 text-[10px] font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-300"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-blue-600 dark:text-sky-400" />
                              <span className="text-blue-600 dark:text-sky-400">
                                {isEn ? "Copied" : "Copiado"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>{isEn ? "Copy" : "Copiar"}</span>
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
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:shadow-none">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-sky-400" />
                  <span>{isEn ? "Thinking..." : "Analizando..."}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-200">
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
            className="border-t border-slate-200/80 bg-slate-100/80 p-3 dark:border-white/10 dark:bg-slate-950/80"
          >
            <div className="flex items-end gap-2 rounded-xl border border-slate-300/80 bg-white p-1.5 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30 dark:border-white/10 dark:bg-white/[0.04]">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEn ? "Type your question..." : "Escribe tu consulta..."}
                disabled={isLoading}
                className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60 dark:text-white dark:placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label={isEn ? "Send message" : "Enviar mensaje"}
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
              {isEn ? "Enter to send · Shift+Enter new line" : "Enter para enviar · Shift+Enter nueva línea"}
            </p>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Cerrar asistente Axioma AI" : "Abrir asistente Axioma AI"}
        title={isOpen ? "Cerrar asistente" : "Axioma AI"}
        className={`group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl shadow-xl shadow-blue-950/40 transition hover:scale-105 hover:shadow-blue-500/45 active:scale-95 ${
          isOpen
            ? "border border-blue-400/35 bg-gradient-to-br from-blue-600 to-sky-500 text-white"
            : "bg-[#020b2d] ring-1 ring-blue-400/40"
        }`}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/brand/axioma-ai-icon.png"
            alt="Axioma AI"
            className="h-full w-full scale-[1.04] object-cover transition-transform duration-200 group-hover:scale-110"
          />
        )}
      </button>
    </div>
  );
}
