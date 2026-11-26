import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { CardState } from "../types/card";
import { CANVAS_HEIGHT, CANVAS_WIDTH, renderFlashCardCanvas } from "../utils/canvasRenderer";
import { sanitizeFilenameSegment } from "../utils/imageHelpers";

interface CanvasPreviewProps {
  state: CardState;
  onNotify: (message: string, type?: "success" | "error") => void;
}

export function CanvasPreview({ state, onNotify }: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderFlashCardCanvas(canvas, state).catch((err) => {
      if (!cancelled) {
        console.error("Gagal merender kanvas:", err);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state]);

  const buildDownloadFilename = () => {
    const prefix =
      state.mode === "welcome" ? "Welcome-On-Board" : "Happy-Birthday";
    const rawName =
      state.mode === "welcome" ? state.welcomeName : state.birthdayName;
    const safeName = sanitizeFilenameSegment(rawName, "Karyawan-Satoria");
    return `${prefix}-${safeName}.png`;
  };

  const handleDownloadPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      await renderFlashCardCanvas(canvas, state);
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = buildDownloadFilename();
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onNotify("Gambar PNG HD berhasil diunduh.", "success");
    } catch {
      onNotify("Gagal mengekspor gambar PNG. Silakan coba lagi.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      onNotify(
        "Browser tidak mendukung salin gambar langsung. Silakan gunakan tombol Download Gambar.",
        "error"
      );
      return;
    }

    setIsExporting(true);
    try {
      await renderFlashCardCanvas(canvas, state);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) {
        throw new Error("Gagal membuat gambar.");
      }
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setCopySuccess(true);
      onNotify("Gambar disalin ke clipboard. Siap di-paste ke WhatsApp.", "success");
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      onNotify(
        "Akses clipboard dibatasi browser. Gunakan tombol Download Gambar (PNG).",
        "error"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section aria-label="Pratinjau Kartu Ucapan" className="flex flex-col gap-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Pratinjau Kanvas HD
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-tabular">
            <span>{CANVAS_WIDTH} × {CANVAS_HEIGHT} px</span>
            <span aria-hidden="true">·</span>
            <span>16:9</span>
            <span aria-hidden="true">·</span>
            <span>PNG Tanpa Watermark</span>
          </div>
        </div>

        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full block object-contain"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0F2942] hover:bg-[#173A5E] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2942]"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download Gambar (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyImage}
            disabled={isExporting}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2942]"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700">Tersalin ke Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                <span>Salin Gambar (Copy Image)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
