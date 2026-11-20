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
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import { ThemeToggle } from "@/components/ThemeProvider";

const ENV_TEMPLATE = `NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id`;

export function AuthGate() {
  const { isEn } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedEnv, setCopiedEnv] = useState(false);

  async function handleGoogleSignIn() {
    if (!auth || !googleProvider) {
      setError(
        isEn
          ? "Firebase is not configured yet in .env.local."
          : "Firebase aún no está configurado en .env.local."
      );
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
        setError(
          isEn
            ? "You closed the Google window before completing sign-in."
            : "Cerraste la ventana de Google antes de completar el acceso."
        );
      } else if (code === "auth/unauthorized-domain") {
        setError(
          isEn
            ? "This domain is not authorized in Firebase Auth. Add it under Authentication → Settings → Authorized domains."
            : "Este dominio no está autorizado en Firebase Auth. Agrégalo en Authentication → Settings → Authorized domains."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : isEn
            ? "Could not sign in with Google."
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
    <div className="bg-hero-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#eef2f7] px-4 py-12 text-slate-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-slate-100">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" aria-label={isEn ? "Back to home" : "Volver al inicio"}>
            <AxiomaLogo variant="auto" size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {isEn ? "Home" : "Inicio"}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/15 dark:bg-[#0f172a]/90 dark:shadow-black/50">
          {/* Official Brand Banner inside Auth Card */}
          <div className="border-b border-slate-200/80 bg-[#19253f] dark:border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/axioma-banner.png"
              alt="Axioma-X"
              className="h-auto w-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold text-blue-700 dark:text-sky-300">
            <Cloud className="h-3.5 w-3.5" />
            Firebase Auth + Cloud Firestore
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isEn ? "Sign in to your workspace" : "Accede a tu espacio de trabajo"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {isEn
              ? "Sign in with Google to save your business profile, service catalog, and quotes privately in the cloud."
              : "Inicia sesión con Google para guardar tu empresa, catálogo de servicios y cotizaciones de forma privada y en tiempo real en la nube."}
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
                    {isEn ? "Connecting to Google..." : "Conectando con Google..."}
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
                    {isEn ? "Continue with Google" : "Continuar con Google"}
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/90 px-3 py-2 dark:border-white/10 dark:bg-[#070b14]">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  {isEn ? "Per-user isolated data" : "Datos aislados por usuario"}
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/90 px-3 py-2 dark:border-white/10 dark:bg-[#070b14]">
                  <Database className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  {isEn ? "Firestore cloud sync" : "Sincronización en Firestore"}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                <p className="font-bold text-amber-800 dark:text-amber-300">
                  {isEn
                    ? "Connect your free Firebase project"
                    : "Falta conectar tu proyecto gratuito de Firebase"}
                </p>
                <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
                  {isEn ? "Create a free project (Spark Plan) at " : "Crea un proyecto gratis (Plan Spark) en "}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-amber-950 dark:hover:text-white"
                  >
                    console.firebase.google.com
                  </a>
                  {isEn
                    ? ", enable Authentication (Google) and Cloud Firestore, and paste your keys into "
                    : ", activa Authentication (Google) y Cloud Firestore, y pega tus claves en "}
                  <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[11px] dark:bg-black/40">
                    .env.local
                  </code>
                  :
                </p>
              </div>

              <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-3.5 dark:border-white/10 dark:bg-[#070b14]">
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="h-3 w-3 text-blue-400" />
                      {isEn ? "Copied" : "Copiado"}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      {isEn ? "Copy" : "Copiar"}
                    </>
                  )}
                </button>
                <pre className="overflow-x-auto pr-16 font-mono text-[11px] leading-relaxed text-sky-300">
                  {ENV_TEMPLATE}
                </pre>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn ? "After saving " : "Después de guardar "}
                <code className="font-mono text-slate-800 dark:text-slate-200">.env.local</code>
                {isEn ? ", restart " : ", reinicia "}
                <code className="font-mono text-slate-800 dark:text-slate-200">npm run dev</code>
                {isEn ? " and the " : " y el botón de "}
                <strong>{isEn ? "Continue with Google" : "Continuar con Google"}</strong>
                {isEn ? " button will appear automatically." : " aparecerá automáticamente."}
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
