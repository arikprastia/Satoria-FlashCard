import { ChangeEvent, useRef, useState } from "react";
import {
  Briefcase,
  Calendar,
  Image as ImageIcon,
  Loader2,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  ZoomIn,
} from "lucide-react";
import {
  AI_BG_PRESETS,
  AI_PHOTO_PRESETS,
  BIRTHDAY_BODY_FONT_OPTIONS,
  BIRTHDAY_THEMES,
  COMPANY_OPTIONS,
  CardFontId,
  CardState,
  LOGO_SIZE_PRESETS,
  LogoMode,
  NAME_FONT_OPTIONS,
  TITLE_FONT_OPTIONS,
  WELCOME_DATA_FONT_OPTIONS,
  WELCOME_THEMES,
} from "../types/card";
import { formatIndonesianDate } from "../utils/canvasRenderer";
import {
  prepareImageForUpload,
  readFileAsDataUrl,
} from "../utils/imageHelpers";

interface ControlPanelProps {
  state: CardState;
  onChange: (updater: (prev: CardState) => CardState) => void;
  onNotify: (message: string, type?: "success" | "error") => void;
  onClearCustomLogo: () => void;
}

export function ControlPanel({
  state,
  onChange,
  onNotify,
  onClearCustomLogo,
}: ControlPanelProps) {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const [aiInstruction, setAiInstruction] = useState<string>(
    AI_PHOTO_PRESETS[0].instruction
  );
  const [aiBgInstruction, setAiBgInstruction] = useState<string>(
    AI_BG_PRESETS.welcome[0].prompt
  );
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onNotify("Mohon pilih file gambar JPG, PNG, atau WEBP.", "error");
      return;
    }

    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      const prepared = await prepareImageForUpload(rawDataUrl, 1400, 0.92);
      onChange((prev) => ({
        ...prev,
        originalPhotoDataUrl: prepared.dataUrl,
        currentPhotoDataUrl: prepared.dataUrl,
        photoZoom: 1,
        photoOffsetX: 0,
        photoOffsetY: 0,
      }));
      onNotify("Foto karyawan berhasil dimuat ke kanvas.", "success");
    } catch {
      onNotify("Gagal memuat foto yang dipilih.", "error");
    } finally {
      e.target.value = "";
    }
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onNotify("Mohon pilih file logo PNG, JPG, atau WEBP.", "error");
      return;
    }

    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      const prepared = await prepareImageForUpload(rawDataUrl, 600, 0.95);
      onChange((prev) => ({
        ...prev,
        customLogoDataUrl: prepared.dataUrl,
        logoMode: "custom",
      }));
      onNotify("Logo custom tersimpan di browser dan aktif pada kanvas.", "success");
    } catch {
      onNotify("Gagal memproses logo custom.", "error");
    } finally {
      e.target.value = "";
    }
  };

  const handleRunPhotoAi = async () => {
    if (!state.currentPhotoDataUrl) {
      onNotify("Silakan unggah foto karyawan terlebih dahulu.", "error");
      return;
    }
    if (!aiInstruction.trim()) {
      onNotify("Silakan isi atau pilih instruksi edit foto AI.", "error");
      return;
    }

    setIsEditingPhoto(true);
    try {
      const prepared = await prepareImageForUpload(
        state.currentPhotoDataUrl,
        1280,
        0.9
      );
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit_photo",
          imageBase64: prepared.dataUrl,
          mimeType: prepared.mimeType,
          instruction: aiInstruction.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.imageDataUrl) {
        throw new Error(data.error || "Gagal memproses foto dengan AI.");
      }

      onChange((prev) => ({
        ...prev,
        currentPhotoDataUrl: data.imageDataUrl,
      }));
      onNotify("Foto berhasil disunting oleh AI.", "success");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kendala saat menghubungi layanan AI.";
      onNotify(msg, "error");
    } finally {
      setIsEditingPhoto(false);
    }
  };

  const handleGenerateBackgroundAi = async () => {
    if (!aiBgInstruction.trim()) {
      onNotify("Silakan isi atau pilih deskripsi background AI.", "error");
      return;
    }

    setIsGeneratingBg(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_background",
          mode: state.mode,
          instruction: aiBgInstruction.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.imageDataUrl) {
        throw new Error(data.error || "Gagal membuat background dengan AI.");
      }

      onChange((prev) => ({
        ...prev,
        ...(prev.mode === "welcome"
          ? { aiWelcomeBgDataUrl: data.imageDataUrl }
          : { aiBirthdayBgDataUrl: data.imageDataUrl }),
        aiBgTextTone: data.textTone === "light" ? "light" : "dark",
      }));
      onNotify("Background AI baru berhasil diterapkan ke kanvas.", "success");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kendala saat membuat background AI.";
      onNotify(msg, "error");
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const handleClearAiBackground = () => {
    onChange((prev) =>
      prev.mode === "welcome"
        ? { ...prev, aiWelcomeBgDataUrl: null }
        : { ...prev, aiBirthdayBgDataUrl: null }
    );
    onNotify("Background dikembalikan ke tema bawaan.", "success");
  };

  const handleResetPhotoToOriginal = () => {
    if (!state.originalPhotoDataUrl) return;
    onChange((prev) => ({
      ...prev,
      currentPhotoDataUrl: prev.originalPhotoDataUrl,
    }));
    onNotify("Foto dikembalikan ke gambar asli sebelum edit AI.", "success");
  };

  const handleGenerateWishAi = async () => {
    setIsGeneratingWish(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_wish",
          name: state.birthdayName,
          age: state.age,
          showAge: state.showAge,
          placement: state.birthdayPlacement,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.wish) {
        throw new Error(data.error || "Gagal membuat ucapan ulang tahun AI.");
      }
      onChange((prev) => ({
        ...prev,
        birthdayWish: data.wish,
      }));
      onNotify("Ucapan ulang tahun AI berhasil dibuat.", "success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal terhubung ke layanan AI.";
      onNotify(msg, "error");
    } finally {
      setIsGeneratingWish(false);
    }
  };

  const isEditedByAi =
    Boolean(state.originalPhotoDataUrl) &&
    state.currentPhotoDataUrl !== state.originalPhotoDataUrl;

  const activeAiBg =
    state.mode === "welcome"
      ? state.aiWelcomeBgDataUrl
      : state.aiBirthdayBgDataUrl;

  const bgPresetsForMode =
    state.mode === "welcome" ? AI_BG_PRESETS.welcome : AI_BG_PRESETS.birthday;

  const setLogoMode = (mode: LogoMode) => {
    onChange((prev) => ({ ...prev, logoMode: mode }));
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-7">
      {/* 1. Logo Perusahaan & Penyesuaian Ukuran/Posisi */}
      <section aria-labelledby="section-brand-logo" className="space-y-4">
        <div>
          <h3
            id="section-brand-logo"
            className="text-sm font-semibold text-slate-900"
          >
            Logo Perusahaan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih logo dan sesuaikan ukuran serta posisinya pada kanvas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setLogoMode("satoria-group")}
            className={`min-h-[42px] px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              state.logoMode === "satoria-group"
                ? "bg-[#0F2942] text-white border-[#0F2942]"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Satoria Group
          </button>

          <button
            type="button"
            onClick={() => setLogoMode("satoria-pharma")}
            className={`min-h-[42px] px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              state.logoMode === "satoria-pharma"
                ? "bg-[#0F766E] text-white border-[#0F766E]"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Satoria Pharma
          </button>

          {state.customLogoDataUrl && (
            <button
              type="button"
              onClick={() => setLogoMode("custom")}
              className={`min-h-[42px] px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                state.logoMode === "custom"
                  ? "bg-[#B08016] text-white border-[#B08016]"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Logo Custom
            </button>
          )}

          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="min-h-[42px] px-3.5 py-2 rounded-lg text-xs font-semibold border border-dashed border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload Logo</span>
          </button>

          {state.customLogoDataUrl && (
            <button
              type="button"
              onClick={onClearCustomLogo}
              title="Hapus Logo Custom"
              className="min-h-[42px] px-2.5 py-2 rounded-lg text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* Penyesuaian Ukuran & Posisi Logo */}
        <div className="space-y-3 bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Penyesuaian Ukuran & Posisi Logo
            </span>
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  logoScale: 1,
                  logoOffsetX: 0,
                  logoOffsetY: 0,
                }))
              }
              className="text-xs font-medium text-[#0F2942] hover:underline cursor-pointer"
            >
              Reset Logo
            </button>
          </div>

          {/* Quick Size Options */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 shrink-0">Opsi Ukuran:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {LOGO_SIZE_PRESETS.map((preset) => {
                const isActive = Math.abs(state.logoScale - preset.scale) < 0.03;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({ ...prev, logoScale: preset.scale }))
                    }
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#0F2942] text-white border-[#0F2942]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                  Ukuran Logo
                </span>
                <span className="font-mono-tabular text-slate-800">
                  {state.logoScale.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={3.0}
                step={0.05}
                value={state.logoScale}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    logoScale: parseFloat(e.target.value),
                  }))
                }
                className="w-full studio-slider"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MoveHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    Geser X
                  </span>
                  <span className="font-mono-tabular text-slate-800">
                    {state.logoOffsetX > 0
                      ? `+${state.logoOffsetX}`
                      : state.logoOffsetX}
                  </span>
                </div>
                <input
                  type="range"
                  min={-400}
                  max={80}
                  step={2}
                  value={state.logoOffsetX}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      logoOffsetX: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full studio-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MoveVertical className="w-3.5 h-3.5 text-slate-400" />
                    Geser Y
                  </span>
                  <span className="font-mono-tabular text-slate-800">
                    {state.logoOffsetY > 0
                      ? `+${state.logoOffsetY}`
                      : state.logoOffsetY}
                  </span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={300}
                  step={2}
                  value={state.logoOffsetY}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      logoOffsetY: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full studio-slider"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* 2. Variasi Background & Generate Background AI (Tampil di Welcome & Birthday) */}
      <section aria-labelledby="section-background" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3
              id="section-background"
              className="text-sm font-semibold text-slate-900"
            >
              Variasi Background{" "}
              {state.mode === "welcome" ? "Welcome On Board" : "Happy Birthday"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih variasi tema bawaan atau buat desain baru dengan AI.
            </p>
          </div>
          {activeAiBg && (
            <button
              type="button"
              onClick={handleClearAiBackground}
              className="text-xs font-semibold text-[#0F2942] hover:underline cursor-pointer"
            >
              Kembali ke Tema Bawaan
            </button>
          )}
        </div>

        {/* 4 Preset Theme Swatches */}
        {state.mode === "welcome" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {WELCOME_THEMES.map((theme) => {
              const active = !activeAiBg && state.welcomeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      welcomeTheme: theme.id,
                      aiWelcomeBgDataUrl: null,
                    }))
                  }
                  className={`min-h-[54px] p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    active
                      ? "border-[#0F2942] ring-2 ring-[#0F2942]/15 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className="w-full h-5 rounded-md border border-black/10"
                    style={{
                      background: `linear-gradient(135deg, ${theme.swatchTop} 0%, ${theme.swatchBottom} 100%)`,
                    }}
                  />
                  <span className="text-[11px] font-semibold text-slate-800 truncate block">
                    {theme.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BIRTHDAY_THEMES.map((theme) => {
              const active = !activeAiBg && state.birthdayTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      birthdayTheme: theme.id,
                      aiBirthdayBgDataUrl: null,
                    }))
                  }
                  className={`min-h-[54px] p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    active
                      ? "border-[#0F2942] ring-2 ring-[#0F2942]/15 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className="w-full h-5 rounded-md border border-black/10"
                    style={{
                      background: `linear-gradient(135deg, ${theme.swatchTop} 0%, ${theme.swatchBottom} 100%)`,
                    }}
                  />
                  <span className="text-[11px] font-semibold text-slate-800 truncate block">
                    {theme.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Generate Background AI */}
        <div className="space-y-3 bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Generate Background AI (Opsional)
            </span>
            {activeAiBg && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Teks:</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({ ...prev, aiBgTextTone: "dark" }))
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                    state.aiBgTextTone === "dark"
                      ? "bg-[#0F2942] text-white border-[#0F2942]"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  Gelap
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({ ...prev, aiBgTextTone: "light" }))
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                    state.aiBgTextTone === "light"
                      ? "bg-[#0F2942] text-white border-[#0F2942]"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  Terang
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {bgPresetsForMode.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setAiBgInstruction(preset.prompt);
                  onChange((prev) => ({
                    ...prev,
                    aiBgTextTone: preset.suggestedTone,
                  }));
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  aiBgInstruction === preset.prompt
                    ? "bg-[#FEF9EC] text-[#8F640C] border-[#D4AF37]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            value={aiBgInstruction}
            onChange={(e) => setAiBgInstruction(e.target.value)}
            placeholder="Deskripsikan gaya background korporat yang diinginkan..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
          />

          <button
            type="button"
            onClick={handleGenerateBackgroundAi}
            disabled={isGeneratingBg}
            className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-[#0F2942] hover:bg-[#173A5E] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingBg ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Membuat Background AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Generate Background AI</span>
              </>
            )}
          </button>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* 3. Pilihan Gaya Font Judul & Nama */}
      <section aria-labelledby="section-typography" className="space-y-4">
        <div>
          <h3
            id="section-typography"
            className="text-sm font-semibold text-slate-900"
          >
            Gaya Font Judul & Nama
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih gaya Serif formal atau Script santai untuk judul dan nama karyawan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-2.5">
            <div>
              <label
                htmlFor="select-title-font"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Font Judul Kartu
              </label>
              <select
                id="select-title-font"
                value={state.titleFont}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    titleFont: e.target.value as CardFontId,
                  }))
                }
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
              >
                <optgroup label="Serif Formal">
                  {TITLE_FONT_OPTIONS.filter((f) => f.category === "Serif Formal").map(
                    (f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    )
                  )}
                </optgroup>
                <optgroup label="Script Santai & Modern">
                  {TITLE_FONT_OPTIONS.filter((f) => f.category !== "Serif Formal").map(
                    (f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    )
                  )}
                </optgroup>
              </select>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-3 py-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Ukuran Judul</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono-tabular text-slate-800">
                    {state.titleFontScale.toFixed(2)}x
                  </span>
                  {Math.abs(state.titleFontScale - 1) > 0.01 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({ ...prev, titleFontScale: 1 }))
                      }
                      className="text-[11px] font-medium text-[#0F2942] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.05}
                value={state.titleFontScale}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    titleFontScale: parseFloat(e.target.value),
                  }))
                }
                className="w-full studio-slider"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <div>
              <label
                htmlFor="select-name-font"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Font Nama Karyawan
              </label>
              <select
                id="select-name-font"
                value={state.nameFont}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    nameFont: e.target.value as CardFontId,
                  }))
                }
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
              >
                <optgroup label="Script Santai">
                  {NAME_FONT_OPTIONS.filter((f) => f.category === "Script Santai").map(
                    (f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    )
                  )}
                </optgroup>
                <optgroup label="Serif Formal & Sans">
                  {NAME_FONT_OPTIONS.filter((f) => f.category !== "Script Santai").map(
                    (f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    )
                  )}
                </optgroup>
              </select>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-3 py-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Ukuran Nama</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono-tabular text-slate-800">
                    {state.nameFontScale.toFixed(2)}x
                  </span>
                  {Math.abs(state.nameFontScale - 1) > 0.01 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({ ...prev, nameFontScale: 1 }))
                      }
                      className="text-[11px] font-medium text-[#0F2942] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={0.7}
                max={1.5}
                step={0.05}
                value={state.nameFontScale}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    nameFontScale: parseFloat(e.target.value),
                  }))
                }
                className="w-full studio-slider"
              />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* 4. Upload & Edit Foto AI */}
      <section aria-labelledby="section-photo-ai" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3
              id="section-photo-ai"
              className="text-sm font-semibold text-slate-900"
            >
              Foto Karyawan & Edit AI
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah foto portrait JPG/PNG/WEBP lalu sesuaikan atau rapikan dengan AI.
            </p>
          </div>
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{state.currentPhotoDataUrl ? "Ganti Foto" : "Upload Foto"}</span>
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-slate-700">
            Preset Instruksi Cepat (1-Klik)
          </span>
          <div className="flex flex-wrap gap-2">
            {AI_PHOTO_PRESETS.map((preset) => {
              const Icon =
                preset.id === "enhance"
                  ? Sparkles
                  : preset.id === "formal-suit"
                    ? Briefcase
                    : ImageIcon;
              const isSelected = aiInstruction.trim() === preset.instruction;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setAiInstruction(preset.instruction)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "bg-[#FEF9EC] text-[#8F640C] border-[#D4AF37]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="ai-photo-instruction"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Instruksi Edit Foto AI
          </label>
          <textarea
            id="ai-photo-instruction"
            rows={2}
            value={aiInstruction}
            onChange={(e) => setAiInstruction(e.target.value)}
            placeholder="Contoh: Ubah pakaian menjadi jas formal hitam rapi dan cerahkan wajah..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleRunPhotoAi}
            disabled={isEditingPhoto || !state.currentPhotoDataUrl}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#B08016] hover:bg-[#966C10] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isEditingPhoto ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Memproses Foto AI...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 shrink-0" />
                <span>Generate / Edit Foto dengan AI</span>
              </>
            )}
          </button>

          {isEditedByAi && (
            <button
              type="button"
              onClick={handleResetPhotoToOriginal}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Kembalikan Foto Asli</span>
            </button>
          )}
        </div>

        <div className="pt-2 space-y-3 bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Penyesuaian Posisi Bingkai Foto
            </span>
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  photoZoom: 1,
                  photoOffsetX: 0,
                  photoOffsetY: 0,
                }))
              }
              className="text-xs font-medium text-[#0F2942] hover:underline cursor-pointer"
            >
              Reset Posisi
            </button>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                  Zoom Foto
                </span>
                <span className="font-mono-tabular text-slate-800">
                  {state.photoZoom.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.6}
                max={2.0}
                step={0.02}
                value={state.photoZoom}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    photoZoom: parseFloat(e.target.value),
                  }))
                }
                className="w-full studio-slider"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MoveHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    Geser X
                  </span>
                  <span className="font-mono-tabular text-slate-800">
                    {state.photoOffsetX > 0
                      ? `+${state.photoOffsetX}`
                      : state.photoOffsetX}
                  </span>
                </div>
                <input
                  type="range"
                  min={-250}
                  max={250}
                  step={2}
                  value={state.photoOffsetX}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      photoOffsetX: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full studio-slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MoveVertical className="w-3.5 h-3.5 text-slate-400" />
                    Geser Y
                  </span>
                  <span className="font-mono-tabular text-slate-800">
                    {state.photoOffsetY > 0
                      ? `+${state.photoOffsetY}`
                      : state.photoOffsetY}
                  </span>
                </div>
                <input
                  type="range"
                  min={-250}
                  max={250}
                  step={2}
                  value={state.photoOffsetY}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      photoOffsetY: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full studio-slider"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* 4. Form Input Data */}
      {state.mode === "welcome" ? (
        <section aria-labelledby="section-welcome-form" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3
              id="section-welcome-form"
              className="text-sm font-semibold text-slate-900"
            >
              Data Karyawan Baru (Welcome On Board)
            </h3>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-2.5 bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5">
              <div>
                <label
                  htmlFor="select-welcome-data-font"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Font Teks Data Karyawan (Serif Formal, Script, atau Sans)
                </label>
                <select
                  id="select-welcome-data-font"
                  value={state.welcomeDataFont}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      welcomeDataFont: e.target.value as CardFontId,
                    }))
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                >
                  <optgroup label="Sans Korporat & Modern">
                    {WELCOME_DATA_FONT_OPTIONS.filter(
                      (f) => f.category === "Modern Sans"
                    ).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Serif Formal & Editorial">
                    {WELCOME_DATA_FONT_OPTIONS.filter(
                      (f) => f.category === "Serif Formal"
                    ).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Script / Tulisan Tangan">
                    {WELCOME_DATA_FONT_OPTIONS.filter(
                      (f) => f.category === "Script Santai"
                    ).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>Ukuran Font Data Karyawan</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-slate-800">
                      {state.welcomeDataFontScale.toFixed(2)}x
                    </span>
                    {Math.abs(state.welcomeDataFontScale - 1) > 0.01 && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            welcomeDataFontScale: 1,
                          }))
                        }
                        className="text-[11px] font-medium text-[#0F2942] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={0.75}
                  max={1.4}
                  step={0.05}
                  value={state.welcomeDataFontScale}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      welcomeDataFontScale: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full studio-slider"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="welcome-name"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Nama Karyawan
              </label>
              <input
                id="welcome-name"
                type="text"
                value={state.welcomeName}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, welcomeName: e.target.value }))
                }
                placeholder="Masukkan nama lengkap karyawan"
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
              />
            </div>

            <div>
              <label
                htmlFor="company-select"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Company Name
              </label>
              <select
                id="company-select"
                value={state.companyOption}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, companyOption: e.target.value }))
                }
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
              >
                {COMPANY_OPTIONS.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
                <option value="manual">Ketik Manual...</option>
              </select>

              {state.companyOption === "manual" && (
                <input
                  type="text"
                  value={state.customCompanyName}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      customCompanyName: e.target.value,
                    }))
                  }
                  placeholder="Masukkan nama perusahaan secara manual"
                  className="mt-2 w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="welcome-position"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Position
                </label>
                <input
                  id="welcome-position"
                  type="text"
                  value={state.position}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, position: e.target.value }))
                  }
                  placeholder="Jabatan / posisi"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                />
              </div>

              <div>
                <label
                  htmlFor="welcome-joindate"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Join Date
                </label>
                <div className="relative">
                  <input
                    ref={dateInputRef}
                    id="welcome-joindate"
                    type="date"
                    value={state.joinDate}
                    onClick={() => {
                      try {
                        dateInputRef.current?.showPicker?.();
                      } catch {
                        // Browser fallback uses native date click
                      }
                    }}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, joinDate: e.target.value }))
                    }
                    className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                  />
                </div>
                {state.joinDate && (
                  <p className="mt-1 text-[11px] text-slate-500 inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Tampil: {formatIndonesianDate(state.joinDate)}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="welcome-email"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="welcome-email"
                  type="email"
                  value={state.email}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@perusahaan.co.id"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                />
              </div>

              <div>
                <label
                  htmlFor="welcome-placement"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Placement
                </label>
                <input
                  id="welcome-placement"
                  type="text"
                  value={state.placement}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, placement: e.target.value }))
                  }
                  placeholder="Lokasi penempatan"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section aria-labelledby="section-birthday-form" className="space-y-4">
          <h3
            id="section-birthday-form"
            className="text-sm font-semibold text-slate-900"
          >
            Data Ucapan Ulang Tahun (Happy Birthday)
          </h3>

          <div className="space-y-3.5">
            <div className="space-y-2.5 bg-slate-50/80 border border-slate-200/70 rounded-xl p-3.5">
              <div>
                <label
                  htmlFor="select-birthday-body-font"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Font Teks Ucapan & Info (Serif Formal, Script, atau Sans)
                </label>
                <select
                  id="select-birthday-body-font"
                  value={state.birthdayBodyFont}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      birthdayBodyFont: e.target.value as CardFontId,
                    }))
                  }
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                >
                  <optgroup label="Modern Sans">
                    {BIRTHDAY_BODY_FONT_OPTIONS.filter(
                      (f) => f.category === "Modern Sans"
                    ).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Serif Formal & Hangat">
                    {BIRTHDAY_BODY_FONT_OPTIONS.filter(
                      (f) => f.category === "Serif Formal"
                    ).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Script / Tulisan Tangan">
                    {BIRTHDAY_BODY_FONT_OPTIONS.filter(
                      (f) => f.category === "Script Santai"
                    ).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>Ukuran Font Ucapan & Info</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-slate-800">
                      {state.birthdayBodyFontScale.toFixed(2)}x
                    </span>
                    {Math.abs(state.birthdayBodyFontScale - 1) > 0.01 && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            birthdayBodyFontScale: 1,
                          }))
                        }
                        className="text-[11px] font-medium text-[#0F2942] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={0.75}
                  max={1.6}
                  step={0.05}
                  value={state.birthdayBodyFontScale}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      birthdayBodyFontScale: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full studio-slider"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="birthday-name"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Nama Karyawan
              </label>
              <input
                id="birthday-name"
                type="text"
                value={state.birthdayName}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, birthdayName: e.target.value }))
                }
                placeholder="Masukkan nama lengkap karyawan"
                className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="birthday-age"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Usia (Tahun)
                </label>
                <input
                  id="birthday-age"
                  type="number"
                  min={17}
                  max={100}
                  value={state.age}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, age: e.target.value }))
                  }
                  placeholder="Contoh: 28"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 font-mono-tabular placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                />
              </div>

              <div>
                <label
                  htmlFor="birthday-placement"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Placement
                </label>
                <input
                  id="birthday-placement"
                  type="text"
                  value={state.birthdayPlacement}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      birthdayPlacement: e.target.value,
                    }))
                  }
                  placeholder="Lokasi penempatan"
                  className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none min-h-[36px]">
              <input
                type="checkbox"
                checked={state.showAge}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, showAge: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-300 text-[#0F2942] focus:ring-[#0F2942]"
              />
              <span>Tampilkan usia pada kartu ucapan</span>
            </label>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="birthday-wish"
                  className="text-xs font-medium text-slate-700"
                >
                  Kotak Teks Ucapan
                </label>
                <button
                  type="button"
                  onClick={handleGenerateWishAi}
                  disabled={isGeneratingWish}
                  className="min-h-[34px] px-3 py-1 rounded-lg bg-[#FEF9EC] hover:bg-[#FCEFC7] text-[#8F640C] border border-[#E5C35C] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isGeneratingWish ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Menyusun Ucapan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Generate Ucapan AI</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="birthday-wish"
                rows={3}
                value={state.birthdayWish}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, birthdayWish: e.target.value }))
                }
                placeholder="Ketik ucapan ulang tahun secara manual atau klik Generate Ucapan AI..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 focus:border-[#0F2942]"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
