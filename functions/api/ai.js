const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
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

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function extractReadableError(rawMessage) {
  const raw = String(rawMessage || "Terjadi kesalahan saat memanggil layanan AI.");
  let extracted = raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      extracted = parsed.error.message;
    }
  } catch {
    // Plain text message
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

async function callGeminiRest(apiKey, modelName, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
      "User-Agent": "aistudio-build",
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) {
    const msg = data?.error?.message || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

async function generateWithFreeTextModels(apiKey, contents, generationConfig = {}) {
  const freeTextModels = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
  let lastError = null;

  for (const modelName of freeTextModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const cfg = { ...generationConfig };
        if (modelName === "gemini-4-hydrogen") {
          cfg.thinkingConfig = { thinkingLevel: "LOW" };
        }
        const data = await callGeminiRest(apiKey, modelName, {
          contents: [{ role: "user", parts: [{ text: contents }] }],
          generationConfig: cfg,
        });
        const text = data?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("")
          .trim();
        if (text) return text;
      } catch (err) {
        lastError = err;
        const msg = extractReadableError(err instanceof Error ? err.message : String(err)).toLowerCase();
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
  const match = svg.match(/<svg[\s\S]*<\/svg>/i);
  if (match) {
    svg = match[0];
  }
  if (!svg.toLowerCase().startsWith("<svg")) {
    throw new Error("Format desain vektor AI tidak valid.");
  }
  svg = svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");

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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const apiKey = context?.env?.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        { error: "GEMINI_API_KEY belum dikonfigurasi pada Environment Variables Cloudflare Pages." },
        500
      );
    }

    const body = await context.request.json().catch(() => ({}));
    const { action } = body;

    if (!action) {
      return jsonResponse({ error: "Parameter action wajib diisi." }, 400);
    }

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

      const rawText = await generateWithFreeTextModels(apiKey, prompt);
      const wish = rawText.replace(/^["']|["']$/g, "");
      return jsonResponse({ wish }, 200);
    }

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
        "3. Gunakan <defs> dengan multi-stop <linearGradient>, <radialGradient>, <pattern>, faset poligon transparan, lingkaran bokeh cahaya lembut, dan garis arsitektural diagonal yang presisi.",
        "4. DILARANG KERAS memasukkan elemen <text>, huruf, angka, logo, atau bingkai foto di dalam SVG.",
        "5. Pastikan kontras area kanan (x=540..1520, y=140..780) cukup tenang dan merata sehingga teks kartu akan terbaca sangat jelas.",
      ].join("\n");

      const jsonStr = await generateWithFreeTextModels(apiKey, prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            textTone: { type: "STRING" },
            svgMarkup: { type: "STRING" },
          },
          required: ["textTone", "svgMarkup"],
        },
      });

      const parsed = JSON.parse(jsonStr);
      const cleanSvg = sanitizeAndWrapSvg(parsed.svgMarkup);
      const imageDataUrl = `data:image/svg+xml;base64,${utf8ToBase64(cleanSvg)}`;
      const textTone = parsed.textTone === "light" ? "light" : "dark";

      return jsonResponse({ imageDataUrl, textTone }, 200);
    }

    if (action === "edit_photo") {
      const { imageBase64, mimeType, instruction } = body;
      if (!imageBase64 || !instruction || !String(instruction).trim()) {
        return jsonResponse(
          { error: "Foto dan instruksi penyuntingan wajib dilengkapi." },
          400
        );
      }

      const parsed = stripDataUrlPrefix(imageBase64, mimeType || "image/jpeg");
      const finalMime = mimeType || parsed.mimeType || "image/jpeg";
      const fullPrompt = [
        "Edit foto portrait karyawan korporat ini sesuai instruksi berikut:",
        String(instruction).trim(),
        "Ketentuan penting: pertahankan identitas wajah asli, bentuk mata, hidung, senyum, dan proporsi kepala agar tetap sangat mirip dengan orang pada foto asli. Hasil harus bersih, tajam, natural, dan siap untuk kartu ucapan korporat profesional tanpa teks atau watermark tambahan.",
      ].join("\n");

      const data = await callGeminiRest(apiKey, "gemini-3.1-flash-lite-image", {
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: finalMime,
                  data: parsed.base64,
                },
              },
              { text: fullPrompt },
            ],
          },
        ],
      });

      const parts = data?.candidates?.[0]?.content?.parts || [];
      let outputImage = null;
      for (const part of parts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || "image/png";
          outputImage = `data:${outMime};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!outputImage) {
        return jsonResponse(
          { error: "AI tidak menghasilkan gambar baru. Coba perjelas instruksi penyuntingan." },
          502
        );
      }

      return jsonResponse({ imageDataUrl: outputImage }, 200);
    }

    return jsonResponse({ error: `Action '${action}' tidak dikenali.` }, 400);
  } catch (err) {
    const message = extractReadableError(err instanceof Error ? err.message : String(err));
    return jsonResponse({ error: message }, 500);
  }
}
