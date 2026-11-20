"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Cloud,
  Copy,
  Database,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { AxiomaLogo } from "@/components/landing/AxiomaLogo";

const ENV_TEMPLATE = `NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id`;

export function AuthGate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedEnv, setCopiedEnv] = useState(false);

  async function handleGoogleSignIn() {
    if (!auth || !googleProvider) {
      setError("Firebase aún no está configurado en .env.local.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      if (code === "auth/popup-closed-by-user") {
        setError("Cerraste la ventana de Google antes de completar el acceso.");
      } else if (code === "auth/unauthorized-domain") {
        setError(
          "Este dominio no está autorizado en Firebase Auth. Agrégalo en Authentication → Settings → Authorized domains."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo iniciar sesión con Google."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCopyEnv() {
    navigator.clipboard.writeText(ENV_TEMPLATE);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  }

  return (
    <div className="bg-hero-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070b14] px-4 py-12 text-slate-100">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" aria-label="Volver al inicio">
            <AxiomaLogo variant="dark" size="md" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Inicio
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0f172a]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {/* Official Brand Banner inside Auth Card */}
          <div className="border-b border-white/10 bg-[#19253f]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/axioma-banner.jpg"
              alt="Axioma-X — Cotizador inteligente"
              className="h-auto w-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
            <Cloud className="h-3.5 w-3.5" />
            Firebase Auth + Cloud Firestore
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
            Accede a tu espacio de trabajo
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Inicia sesión con Google para guardar tu empresa, catálogo de servicios y
            cotizaciones de forma privada y en tiempo real en la nube.
          </p>

          {isFirebaseConfigured ? (
            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                    Conectando con Google...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                      />
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#070b14] px-3 py-2">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  Datos aislados por usuario
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#070b14] px-3 py-2">
                  <Database className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  Sincronización en Firestore
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
                <p className="font-bold text-amber-300">
                  Falta conectar tu proyecto gratuito de Firebase
                </p>
                <p className="mt-1 text-amber-100/80">
                  Crea un proyecto gratis (Plan Spark) en{" "}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-white"
                  >
                    console.firebase.google.com
                  </a>
                  , activa <strong>Authentication (Google)</strong> y{" "}
                  <strong>Cloud Firestore</strong>, y pega tus claves en{" "}
                  <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px]">
                    .env.local
                  </code>
                  :
                </p>
              </div>

              <div className="relative rounded-xl border border-white/10 bg-[#070b14] p-3.5">
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar
                    </>
                  )}
                </button>
                <pre className="overflow-x-auto pr-16 font-mono text-[11px] leading-relaxed text-emerald-300">
                  {ENV_TEMPLATE}
                </pre>
              </div>

              <p className="text-[11px] text-slate-400">
                Después de guardar <code className="font-mono text-slate-200">.env.local</code>,
                reinicia <code className="font-mono text-slate-200">npm run dev</code> y el
                botón de <strong>Continuar con Google</strong> aparecerá automáticamente.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
