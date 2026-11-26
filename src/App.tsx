import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { CanvasPreview } from "./components/CanvasPreview";
import { ControlPanel } from "./components/ControlPanel";
import { COMPANY_OPTIONS, CardMode, CardState } from "./types/card";
import satoriaGroupLogo from "./assets/logos/satoria-group.png";

const CUSTOM_LOGO_STORAGE_KEY = "satoria_custom_logo_v1";

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createInitialState(): CardState {
  return {
    mode: "welcome",
    logoMode: "satoria-group",
    customLogoDataUrl: null,
    logoScale: 1,
    logoOffsetX: 0,
    logoOffsetY: 0,
    welcomeTheme: "ivory-gold",
    birthdayTheme: "royal-gold",
    aiWelcomeBgDataUrl: null,
    aiBirthdayBgDataUrl: null,
    aiBgTextTone: "dark",
    titleFont: "Playfair Display",
    nameFont: "Caveat",
    titleFontScale: 1,
    nameFontScale: 1,
    welcomeDataFont: "Plus Jakarta Sans",
    welcomeDataFontScale: 1,
    birthdayBodyFont: "Plus Jakarta Sans",
    birthdayBodyFontScale: 1,
    originalPhotoDataUrl: null,
    currentPhotoDataUrl: null,
    photoZoom: 1,
    photoOffsetX: 0,
    photoOffsetY: 0,
    welcomeName: "",
    companyOption: COMPANY_OPTIONS[0],
    customCompanyName: "",
    position: "",
    joinDate: getTodayIsoDate(),
    email: "",
    placement: "",
    birthdayName: "",
    age: "",
    showAge: true,
    birthdayPlacement: "",
    birthdayWish: "",
  };
}

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error";
}

export default function App() {
  const [state, setState] = useState<CardState>(() => {
    const base = createInitialState();
    try {
      const savedLogo = localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY);
      if (savedLogo) {
        return { ...base, customLogoDataUrl: savedLogo };
      }
    } catch {
      // Ignore storage access errors
    }
    return base;
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    try {
      if (state.customLogoDataUrl) {
        localStorage.setItem(CUSTOM_LOGO_STORAGE_KEY, state.customLogoDataUrl);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [state.customLogoDataUrl]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleNotify = (text: string, type: "success" | "error" = "success") => {
    setToast({ id: Date.now(), text, type });
  };

  const handleClearCustomLogo = () => {
    try {
      localStorage.removeItem(CUSTOM_LOGO_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setState((prev) => ({
      ...prev,
      customLogoDataUrl: null,
      logoMode: prev.logoMode === "custom" ? "satoria-group" : prev.logoMode,
    }));
    handleNotify("Logo custom dihapus dari penyimpanan browser.", "success");
  };

  const setMode = (mode: CardMode) => {
    setState((prev) => ({ ...prev, mode }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900">
      {/* Compact 3-zone Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/90">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-8">
          <a
            href="/"
            aria-label="Satoria Flash Card Studio"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <img
              src={satoriaGroupLogo}
              alt="Satoria Group"
              className="h-7 sm:h-8 w-auto object-contain shrink-0"
            />
            <span
              className="h-5 w-px bg-slate-200 hidden sm:inline-block shrink-0"
              aria-hidden="true"
            />
            <span className="hidden sm:inline text-sm font-bold tracking-tight text-[#0F2942] whitespace-nowrap">
              Flash Card Studio
            </span>
          </a>

          <nav
            aria-label="Mode Kartu Ucapan"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/70"
          >
            <button
              type="button"
              onClick={() => setMode("welcome")}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                state.mode === "welcome"
                  ? "bg-white text-[#0F2942] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Welcome On Board
            </button>
            <button
              type="button"
              onClick={() => setMode("birthday")}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                state.mode === "birthday"
                  ? "bg-white text-[#0F2942] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Happy Birthday
            </button>
          </nav>

          <div className="hidden md:flex items-center text-xs text-slate-500 font-mono-tabular whitespace-nowrap shrink-0">
            1600 × 900 PNG HD
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 sm:py-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Top Preview Stage */}
          <div className="lg:col-span-7 lg:sticky lg:top-20">
            <CanvasPreview state={state} onNotify={handleNotify} />
          </div>

          {/* Right / Bottom Form & AI Studio Inspector */}
          <div className="lg:col-span-5">
            <ControlPanel
              state={state}
              onChange={setState}
              onNotify={handleNotify}
              onClearCustomLogo={handleClearCustomLogo}
            />
          </div>
        </div>
      </main>

      {/* Non-intrusive Toast Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 max-w-sm bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 flex items-start gap-2.5"
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          )}
          <p className="text-xs sm:text-sm text-slate-800 leading-snug flex-1">
            {toast.text}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
