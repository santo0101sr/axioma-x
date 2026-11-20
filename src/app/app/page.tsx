"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Cloud,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
} from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import {
  clearUserWorkspace,
  createEmptyBusinessProfile,
  deleteUserQuote,
  loadUserWorkspace,
  saveUserBusiness,
  saveUserQuote,
  syncUserCatalog,
  updateUserQuoteStatus,
} from "@/lib/firestore-service";
import { BusinessProfile, CatalogItem, Quote, QuoteStatus } from "@/types/quote";
import { QuoteGenerator } from "@/components/QuoteGenerator";
import { QuoteDashboard } from "@/components/QuoteDashboard";
import { CatalogManager } from "@/components/CatalogManager";
import { BusinessSettings } from "@/components/BusinessSettings";
import { ClientPreviewModal } from "@/components/ClientPreviewModal";
import { AuthGate } from "@/components/AuthGate";
import { AxiomaLogo } from "@/components/landing/AxiomaLogo";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import { ThemeToggle } from "@/components/ThemeProvider";

type TabId = "generator" | "dashboard" | "catalog" | "business";

const TAB_META_ES: Record<
  TabId,
  {
    title: string;
    subtitle: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  generator: {
    label: "Cotizador",
    title: "Nuevo Cotizador",
    subtitle: "Pega un mensaje, dicta o arma tu cotización en segundos.",
    icon: FileText,
  },
  dashboard: {
    label: "Historial",
    title: "Historial Comercial",
    subtitle: "Sigue el estado de tus cotizaciones, edita y exporta reportes.",
    icon: LayoutDashboard,
  },
  catalog: {
    label: "Catálogo",
    title: "Catálogo de Servicios",
    subtitle: "Administra tus tarifas reales para cotizar al instante.",
    icon: Package,
  },
  business: {
    label: "Mi Empresa",
    title: "Configuración de Empresa",
    subtitle: "Personaliza logotipo, impuestos, moneda y respaldos de datos.",
    icon: Briefcase,
  },
};

const TAB_META_EN: Record<
  TabId,
  {
    title: string;
    subtitle: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  generator: {
    label: "Quote Builder",
    title: "New Quote Builder",
    subtitle: "Paste a message, dictate by voice, or build a quote in seconds.",
    icon: FileText,
  },
  dashboard: {
    label: "History",
    title: "Commercial History",
    subtitle: "Track quote statuses, edit proposals, and export reports.",
    icon: LayoutDashboard,
  },
  catalog: {
    label: "Catalog",
    title: "Service Catalog",
    subtitle: "Manage your real pricing to quote accurately and instantly.",
    icon: Package,
  },
  business: {
    label: "My Business",
    title: "Business Settings",
    subtitle: "Customize your logo, taxes, currency, and data backups.",
    icon: Briefcase,
  },
};

function WorkspaceContent() {
  const { isEn } = useLanguage();
  const TAB_META = isEn ? TAB_META_EN : TAB_META_ES;
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [activeTab, setActiveTab] = useState<TabId>("generator");
  const [business, setBusiness] = useState<BusinessProfile>({
    name: "Mi Empresa",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    currency: "USD",
    taxLabel: "IVA",
    taxPercent: 13,
    validityDays: 15,
    defaultNotes: "",
  });
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);

  const businessSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ?tab= query param
  useEffect(() => {
    const queryTab = searchParams.get("tab") as TabId | null;
    if (
      queryTab &&
      (["generator", "dashboard", "catalog", "business"] as TabId[]).includes(queryTab)
    ) {
      setActiveTab(queryTab);
    }
  }, [searchParams]);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser) {
        setDataLoading(true);
        try {
          const loaded = await loadUserWorkspace(firebaseUser);
          setBusiness(loaded.business);
          setCatalog(loaded.catalog);
          setQuotes(loaded.quotes);
          setSyncState("saved");
        } catch {
          setBusiness(createEmptyBusinessProfile(firebaseUser));
          setCatalog([]);
          setQuotes([]);
          setSyncState("error");
        } finally {
          setDataLoading(false);
        }
      } else {
        setCatalog([]);
        setQuotes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  function markSyncing() {
    setSyncState("saving");
  }

  function markSynced() {
    setSyncState("saved");
  }

  function handleBusinessChange(next: BusinessProfile) {
    setBusiness(next);
    if (!user) return;
    markSyncing();
    if (businessSaveTimer.current) clearTimeout(businessSaveTimer.current);
    businessSaveTimer.current = setTimeout(async () => {
      try {
        await saveUserBusiness(user.uid, next);
        markSynced();
      } catch {
        setSyncState("error");
      }
    }, 500);
  }

  async function handleCatalogChange(nextCatalog: CatalogItem[]) {
    const prev = catalog;
    setCatalog(nextCatalog);
    if (!user) return;
    markSyncing();
    try {
      await syncUserCatalog(user.uid, prev, nextCatalog);
      markSynced();
    } catch {
      setSyncState("error");
    }
  }

  async function handleSaveQuote(quote: Quote) {
    setQuotes((prev) => {
      const exists = prev.some((q) => q.id === quote.id);
      if (exists) {
        return prev.map((q) => (q.id === quote.id ? quote : q));
      }
      return [quote, ...prev];
    });
    if (!user) return;
    markSyncing();
    try {
      await saveUserQuote(user.uid, quote);
      markSynced();
    } catch {
      setSyncState("error");
    }
  }

  async function handleStatusChange(id: string, status: QuoteStatus) {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    if (!user) return;
    markSyncing();
    try {
      await updateUserQuoteStatus(user.uid, id, status);
      markSynced();
    } catch {
      setSyncState("error");
    }
  }

  async function handleDeleteQuote(id: string) {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    if (!user) return;
    markSyncing();
    try {
      await deleteUserQuote(user.uid, id);
      markSynced();
    } catch {
      setSyncState("error");
    }
  }

  function handleEditQuote(quote: Quote) {
    setEditingQuote(quote);
    setActiveTab("generator");
  }

  async function handleImportBackup(data: {
    business?: BusinessProfile;
    catalog?: CatalogItem[];
    quotes?: Quote[];
  }) {
    if (!user) return;
    markSyncing();
    try {
      if (data.business) {
        setBusiness(data.business);
        await saveUserBusiness(user.uid, data.business);
      }
      if (Array.isArray(data.catalog)) {
        await syncUserCatalog(user.uid, catalog, data.catalog);
        setCatalog(data.catalog);
      }
      if (Array.isArray(data.quotes)) {
        setQuotes(data.quotes);
        for (const q of data.quotes) {
          await saveUserQuote(user.uid, q);
        }
      }
      markSynced();
    } catch {
      setSyncState("error");
    }
  }

  async function handleResetDefaults() {
    if (!user) return;
    markSyncing();
    try {
      const cleanBusiness = await clearUserWorkspace(user.uid, user, catalog, quotes);
      setBusiness(cleanBusiness);
      setCatalog([]);
      setQuotes([]);
      markSynced();
    } catch {
      setSyncState("error");
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    await signOut(auth);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#070b14] text-slate-300">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <p className="text-xs font-medium text-slate-400">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  if (dataLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#eef2f7] text-slate-600 dark:bg-[#070b14] dark:text-slate-300">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Cargando tus datos desde Firestore...
        </p>
      </div>
    );
  }

  const currentMeta = TAB_META[activeTab];

  return (
    <div className="flex min-h-screen bg-[#eef2f7] text-slate-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-slate-100">
      {/* Desktop Left Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/90 bg-[#f8fafc] p-4 dark:border-white/10 dark:bg-[#0b1120] lg:flex">
        <div>
          {/* Brand + Home link */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <Link href="/" aria-label="Volver al inicio">
              <AxiomaLogo variant="auto" size="sm" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              title="Volver a la página principal"
            >
              <ArrowLeft className="h-3 w-3" />
              Inicio
            </Link>
          </div>

          {/* Active Company Card */}
          <div className="mt-5 rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              {isEn ? "Your business" : "Tu empresa"}
            </div>
            <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
              {business.name || (isEn ? "Unnamed" : "Sin nombre")}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {business.currency} • {business.taxLabel} {business.taxPercent}%
            </p>
          </div>

          {/* Primary Navigation */}
          <nav className="mt-6 space-y-1">
            {(["generator", "dashboard", "catalog", "business"] as TabId[]).map(
              (tabId) => {
                const meta = TAB_META[tabId];
                const Icon = meta.icon;
                const isActive = activeTab === tabId;
                const badge =
                  tabId === "dashboard"
                    ? quotes.length
                    : tabId === "catalog"
                    ? catalog.length
                    : null;

                return (
                  <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-blue-600/10 text-blue-700 ring-1 ring-blue-500/30 dark:bg-blue-500/15 dark:text-sky-300"
                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                      {meta.label}
                    </span>
                    {badge !== null && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          isActive
                            ? "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                            : "bg-slate-200/80 text-slate-600 dark:bg-white/5 dark:text-slate-400"
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </nav>
        </div>

        {/* Authenticated Google Account Footer */}
        <div className="border-t border-slate-200/90 pt-4 dark:border-white/10">
          <div className="flex items-center gap-2.5 px-1">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName || (isEn ? "User" : "Usuario")}
                className="h-8 w-8 rounded-full border border-slate-300 object-cover dark:border-white/15"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-sky-300">
                {(user.displayName || user.email || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {user.displayName || (isEn ? "User" : "Usuario")}
              </p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-400/50 hover:bg-rose-50 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isEn ? "Sign out" : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f8fafc]/95 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1120]/95 lg:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
              <AxiomaLogo variant="auto" size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                {isEn ? "Exit" : "Salir"}
              </button>
            </div>
          </div>

          <nav className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
            {(["generator", "dashboard", "catalog", "business"] as TabId[]).map(
              (tabId) => {
                const meta = TAB_META[tabId];
                const Icon = meta.icon;
                const isActive = activeTab === tabId;
                return (
                  <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200/70 text-slate-600 dark:bg-white/5 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </button>
                );
              }
            )}
          </nav>
        </header>

        {/* Workspace Page Header */}
        <div className="border-b border-slate-200/80 bg-[#f8fafc] px-5 py-5 transition-colors duration-300 dark:border-white/10 dark:bg-[#090e1a] sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {currentMeta.title}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {currentMeta.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <LanguageToggle className="hidden lg:inline-flex" />
              <ThemeToggle className="hidden lg:inline-flex" />
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
              {syncState === "saving" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-600 dark:text-slate-300">
                    {isEn ? "Saving to Firestore..." : "Guardando en Firestore..."}
                  </span>
                </>
              ) : syncState === "error" ? (
                <>
                  <Cloud className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="text-rose-700 dark:text-rose-300">
                    {isEn ? "Sync error" : "Error de sincronización"}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-sky-300">
                    {isEn ? "Firestore synced" : "Firestore sincronizado"}
                  </span>
                </>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Active View */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8">
          {activeTab === "generator" && (
            <QuoteGenerator
              business={business}
              catalog={catalog}
              editingQuote={editingQuote}
              onClearEditing={() => setEditingQuote(null)}
              onSaveQuote={handleSaveQuote}
              onPreviewClient={(q) => setPreviewQuote(q)}
            />
          )}

          {activeTab === "dashboard" && (
            <QuoteDashboard
              quotes={quotes}
              business={business}
              onStatusChange={handleStatusChange}
              onEditQuote={handleEditQuote}
              onDelete={handleDeleteQuote}
              onPreviewClient={(q) => setPreviewQuote(q)}
            />
          )}

          {activeTab === "catalog" && (
            <CatalogManager
              catalog={catalog}
              currency={business.currency}
              onChange={handleCatalogChange}
            />
          )}

          {activeTab === "business" && (
            <BusinessSettings
              business={business}
              catalog={catalog}
              quotes={quotes}
              onChange={handleBusinessChange}
              onImportBackup={handleImportBackup}
              onResetDefaults={handleResetDefaults}
            />
          )}
        </main>
      </div>

      {previewQuote && (
        <ClientPreviewModal
          quote={previewQuote}
          business={business}
          onClose={() => setPreviewQuote(null)}
          onApprove={(id) => {
            void handleSaveQuote({ ...previewQuote, status: "approved" });
            void handleStatusChange(id, "approved");
            setPreviewQuote(null);
          }}
          onRequestChange={(id) => {
            void handleSaveQuote({ ...previewQuote, status: "sent" });
            void handleStatusChange(id, "sent");
            setPreviewQuote(null);
          }}
        />
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#070b14] text-sm text-slate-400">
          Cargando Axioma-X...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
