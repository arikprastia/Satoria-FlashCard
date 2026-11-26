import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi pada environment server.");
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function stripDataUrlPrefix(input, fallbackMime = "image/jpeg") {
  if (!input || typeof input !== "string") {
    return { base64: "", mimeType: fallbackMime };
  }
  const match = input.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1] || fallbackMime,
      base64: match[2],
    };
  }
  return {
    mimeType: fallbackMime,
    base64: input,
  };
}

function extractReadableError(err) {
  if (!err) return "Terjadi kesalahan saat memanggil layanan AI.";
  const raw = err instanceof Error ? err.message : String(err);
  let extracted = raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      extracted = parsed.error.message;
    }
  } catch {
    // Not JSON
  }
  const lower = extracted.toLowerCase();
  if (
    lower.includes("exceeded your current quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("429")
  ) {
    return "Kuota API key tercapai. Silakan coba lagi sebentar atau periksa kuota API key.";
  }
  if (
    lower.includes("high demand") ||
    lower.includes("overloaded") ||
    lower.includes("503")
  ) {
    return "Server AI sedang mengalami lonjakan permintaan sementara. Silakan klik ulang beberapa detik lagi.";
  }
  return extracted;
}

async function generateWithFreeTextModels(ai, params) {
  const freeTextModels = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
  let lastError = null;

  for (const modelName of freeTextModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config = { ...(params.config || {}) };
        if (modelName === "gemini-4-hydrogen") {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config,
        });
        if (response.text && response.text.trim()) {
          return response.text.trim();
        }
      } catch (err) {
        lastError = err;
        const msg = extractReadableError(err).toLowerCase();
        const isTransient =
          msg.includes("lonjakan") ||
          msg.includes("high demand") ||
          msg.includes("503") ||
          msg.includes("unavailable") ||
          msg.includes("overloaded") ||
          msg.includes("kuota");
        if (!isTransient) break;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error("AI tidak mengembalikan respons.");
}

function sanitizeAndWrapSvg(rawSvg) {
  let svg = String(rawSvg || "").trim();
  // Extract <svg ...>...</svg> if surrounded by markdown fences
  const match = svg.match(/<svg[\s\S]*<\/svg>/i);
  if (match) {
    svg = match[0];
  }
  if (!svg.toLowerCase().startsWith("<svg")) {
    throw new Error("Format desain vektor AI tidak valid.");
  }
  // Remove any unsafe script or foreignObject tags
  svg = svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");

  // Ensure explicit 1600x900 dimensions & xmlns for Canvas Image loading
  if (!/xmlns=/.test(svg)) {
    svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!/viewBox=/.test(svg)) {
    svg = svg.replace("<svg", '<svg viewBox="0 0 1600 900"');
  }
  if (!/width=/.test(svg)) {
    svg = svg.replace("<svg", '<svg width="1600" height="900"');
  }
  return svg;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak diizinkan. Gunakan POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { action } = body;

    if (!action) {
      return res.status(400).json({ error: "Parameter action wajib diisi." });
    }

    const ai = getClient();

    // 1. FREE-TIER: Generate Corporate Birthday Wish
    if (action === "generate_wish") {
      const name = String(body.name || "").trim();
      const age = body.age ? String(body.age).trim() : "";
      const showAge = Boolean(body.showAge);
      const placement = String(body.placement || "").trim();

      const recipientDesc = name
        ? `untuk karyawan bernama "${name}"`
        : "untuk rekan kerja terbaik";
      const ageClause = showAge && age ? ` yang ke-${age} tahun` : "";
      const placementClause = placement
        ? ` yang bertugas di ${placement} (Satoria Group)`
        : " di lingkungan Satoria Group";

      const prompt = [
        `Buatkan 1 ucapan ulang tahun korporat berbahasa Indonesia yang hangat, tulus, elegan, dan profesional ${recipientDesc}${ageClause}${placementClause}.`,
        "Aturan wajib:",
        "- Maksimal 2 kalimat saja agar muat rapi pada kartu ucapan.",
        "- Tidak perlu menuliskan judul 'Happy Birthday', emoji, hashtag, atau tanda kutip pembuka/penutup.",
        "- Gunakan gaya bahasa korporat modern yang penuh apresiasi dan doa kesuksesan serta kesehatan.",
      ].join("\n");

      const rawText = await generateWithFreeTextModels(ai, { contents: prompt });
      const wish = rawText.replace(/^["']|["']$/g, "");

      return res.status(200).json({ wish });
    }

    // 2. FREE-TIER: Generate High-Craft 1600x900 Vector SVG Corporate Background
    if (action === "generate_background") {
      const mode = body.mode === "birthday" ? "birthday" : "welcome";
      const instruction = String(body.instruction || "").trim();

      const modeHint =
        mode === "welcome"
          ? "kartu sambutan karyawan baru (Welcome On Board) dengan panel aksen artistik di sisi kiri (x: 0..450) untuk bingkai foto dan bidang kanan (x: 450..1600) yang bersih, elegan, dan berkelas untuk tipografi."
          : "kartu ucapan ulang tahun korporat (Happy Birthday) dengan komposisi mewah di sisi kiri dan aksen bokeh/geometris/pita perayaan halus di pinggir serta area kanan (x: 520..1600) yang bersih agar teks mudah dibaca.";

      const prompt = [
        `Anda adalah Senior Brand & Graphic Designer kelas eksekutif. Rancang desain SVG vektor 1600x900 yang sangat estetis, tajam, dan mewah untuk ${modeHint}`,
        `Permintaan gaya visual pengguna: "${instruction || "Latar putih gading elegan dengan motif batik geometris emas di sisi kiri dan garis aksen korporat modern"}"`,
        "Ketentuan Teknis SVG (WAJIB DIPATUHI):",
        "1. Kembalikan JSON valid berisi 'textTone' ('dark' jika latar kanan terang, atau 'light' jika latar kanan gelap) dan 'svgMarkup'.",
        "2. 'svgMarkup' harus berupa kode <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1600 900\" width=\"1600\" height=\"900\"> yang valid dan lengkap.",
        "3. Gunakan <defs> dengan multi-stop <linearGradient>, <radialGradient>, <pattern> (misalnya motif batik/kawung/hexagonal/lattice halus), faset poligon transparan, lingkaran bokeh cahaya lembut, dan garis arsitektural diagonal yang presisi.",
        "4. DILARANG KERAS memasukkan elemen <text>, huruf, angka, logo, atau bingkai foto di dalam SVG.",
        "5. Pastikan kontras area kanan (x=540..1520, y=140..780) cukup tenang dan merata sehingga teks kartu akan terbaca sangat jelas.",
      ].join("\n");

      const jsonStr = await generateWithFreeTextModels(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              textTone: {
                type: Type.STRING,
                description: "'dark' if right area background is light, or 'light' if right area background is dark.",
              },
              svgMarkup: {
                type: Type.STRING,
                description: "Complete valid 1600x900 SVG markup without any text elements.",
              },
            },
            required: ["textTone", "svgMarkup"],
          },
        },
      });

      const parsed = JSON.parse(jsonStr);
      const cleanSvg = sanitizeAndWrapSvg(parsed.svgMarkup);
      const base64Svg = Buffer.from(cleanSvg, "utf-8").toString("base64");
      const imageDataUrl = `data:image/svg+xml;base64,${base64Svg}`;
      const textTone = parsed.textTone === "light" ? "light" : "dark";

      return res.status(200).json({ imageDataUrl, textTone });
    }

    // 3. Edit Photo (Image-to-Image)
    if (action === "edit_photo") {
      const { imageBase64, mimeType, instruction } = body;
      if (!imageBase64 || !instruction || !String(instruction).trim()) {
        return res.status(400).json({
          error: "Foto dan instruksi penyuntingan wajib dilengkapi.",
        });
      }

      const parsed = stripDataUrlPrefix(imageBase64, mimeType || "image/jpeg");
      const finalMime = mimeType || parsed.mimeType || "image/jpeg";

      const fullPrompt = [
        "Edit foto portrait karyawan korporat ini sesuai instruksi berikut:",
        String(instruction).trim(),
        "Ketentuan penting: pertahankan identitas wajah asli, bentuk mata, hidung, senyum, dan proporsi kepala agar tetap sangat mirip dengan orang pada foto asli. Hasil harus bersih, tajam, natural, dan siap untuk kartu ucapan korporat profesional tanpa teks atau watermark tambahan.",
      ].join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [
            {
              inlineData: {
                data: parsed.base64,
                mimeType: finalMime,
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      let outputImage = null;

      for (const part of parts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || "image/png";
          outputImage = `data:${outMime};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!outputImage) {
        return res.status(502).json({
          error: "AI tidak menghasilkan gambar baru. Coba perjelas instruksi penyuntingan.",
        });
      }

      return res.status(200).json({ imageDataUrl: outputImage });
    }

    return res.status(400).json({ error: `Action '${action}' tidak dikenali.` });
  } catch (err) {
    console.error("AI endpoint error:", err);
    const message = extractReadableError(err);
    return res.status(500).json({ error: message });
  }
}
