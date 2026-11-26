export type CardMode = "welcome" | "birthday";

export type LogoMode = "satoria-group" | "satoria-pharma" | "custom";

export type WelcomeTheme =
  | "ivory-gold"
  | "navy-gold"
  | "pharma-mint"
  | "warm-executive";

export type BirthdayTheme =
  | "royal-gold"
  | "navy-gold"
  | "pharma-mint"
  | "warm-festive";

export type AiTextTone = "dark" | "light";

export type CardFontId =
  | "Playfair Display"
  | "Cormorant Garamond"
  | "Cinzel"
  | "DM Serif Display"
  | "Lora"
  | "Merriweather"
  | "Caveat"
  | "Great Vibes"
  | "Dancing Script"
  | "Pacifico"
  | "Sacramento"
  | "Kalam"
  | "Plus Jakarta Sans"
  | "DM Sans"
  | "Montserrat"
  | "Poppins"
  | "Space Grotesk";

export interface FontOption {
  id: CardFontId;
  label: string;
  category: "Serif Formal" | "Script Santai" | "Modern Sans";
  isScript?: boolean;
}

export const TITLE_FONT_OPTIONS: FontOption[] = [
  { id: "Playfair Display", label: "Playfair Display — Serif Klasik Elegan", category: "Serif Formal" },
  { id: "Cormorant Garamond", label: "Cormorant Garamond — Serif Editorial Mewah", category: "Serif Formal" },
  { id: "DM Serif Display", label: "DM Serif Display — Serif Kontemporer Tegas", category: "Serif Formal" },
  { id: "Cinzel", label: "Cinzel — Serif Korporat Tegas", category: "Serif Formal" },
  { id: "Lora", label: "Lora — Serif Hangat Modern", category: "Serif Formal" },
  { id: "Caveat", label: "Caveat — Script Brush Santai", category: "Script Santai", isScript: true },
  { id: "Dancing Script", label: "Dancing Script — Script Ramah", category: "Script Santai", isScript: true },
  { id: "Great Vibes", label: "Great Vibes — Kaligrafi Halus", category: "Script Santai", isScript: true },
  { id: "Sacramento", label: "Sacramento — Script Monoline Elegan", category: "Script Santai", isScript: true },
  { id: "Montserrat", label: "Montserrat — Sans Eksekutif Modern", category: "Modern Sans" },
  { id: "Plus Jakarta Sans", label: "Plus Jakarta Sans — Sans Korporat Bersih", category: "Modern Sans" },
];

export const NAME_FONT_OPTIONS: FontOption[] = [
  { id: "Caveat", label: "Caveat — Script Brush Santai", category: "Script Santai", isScript: true },
  { id: "Dancing Script", label: "Dancing Script — Script Ekspresif", category: "Script Santai", isScript: true },
  { id: "Great Vibes", label: "Great Vibes — Kaligrafi Elegan", category: "Script Santai", isScript: true },
  { id: "Sacramento", label: "Sacramento — Signature Halus", category: "Script Santai", isScript: true },
  { id: "Pacifico", label: "Pacifico — Script Tebal Hangat", category: "Script Santai", isScript: true },
  { id: "Kalam", label: "Kalam — Tulisan Tangan Rapi", category: "Script Santai", isScript: true },
  { id: "Playfair Display", label: "Playfair Display — Serif Formal Klasik", category: "Serif Formal" },
  { id: "Cormorant Garamond", label: "Cormorant Garamond — Serif Formal Halus", category: "Serif Formal" },
  { id: "DM Serif Display", label: "DM Serif Display — Serif Tegas Berkarakter", category: "Serif Formal" },
  { id: "Cinzel", label: "Cinzel — Serif Formal Kapital", category: "Serif Formal" },
  { id: "Montserrat", label: "Montserrat — Sans Eksekutif Rapi", category: "Modern Sans" },
  { id: "Plus Jakarta Sans", label: "Plus Jakarta Sans — Sans Formal Rapi", category: "Modern Sans" },
];

export const WELCOME_DATA_FONT_OPTIONS: FontOption[] = [
  { id: "Plus Jakarta Sans", label: "Plus Jakarta Sans — Sans Korporat Rapi", category: "Modern Sans" },
  { id: "DM Sans", label: "DM Sans — Sans Geometris Bersih", category: "Modern Sans" },
  { id: "Montserrat", label: "Montserrat — Sans Eksekutif Tegas", category: "Modern Sans" },
  { id: "Poppins", label: "Poppins — Sans Modern Ramah", category: "Modern Sans" },
  { id: "Space Grotesk", label: "Space Grotesk — Sans Kontemporer Unik", category: "Modern Sans" },
  { id: "Playfair Display", label: "Playfair Display — Serif Klasik Formal", category: "Serif Formal" },
  { id: "Cormorant Garamond", label: "Cormorant Garamond — Serif Mewah Halus", category: "Serif Formal" },
  { id: "DM Serif Display", label: "DM Serif Display — Serif Tegas Elegan", category: "Serif Formal" },
  { id: "Cinzel", label: "Cinzel — Serif Korporat Kapital", category: "Serif Formal" },
  { id: "Lora", label: "Lora — Serif Editorial Hangat", category: "Serif Formal" },
  { id: "Merriweather", label: "Merriweather — Serif Klasik Jelas", category: "Serif Formal" },
  { id: "Caveat", label: "Caveat — Script Brush Santai", category: "Script Santai", isScript: true },
  { id: "Dancing Script", label: "Dancing Script — Script Ramah Ekspresif", category: "Script Santai", isScript: true },
  { id: "Kalam", label: "Kalam — Tulisan Tangan Rapi", category: "Script Santai", isScript: true },
  { id: "Great Vibes", label: "Great Vibes — Kaligrafi Elegan", category: "Script Santai", isScript: true },
  { id: "Sacramento", label: "Sacramento — Script Signature Halus", category: "Script Santai", isScript: true },
  { id: "Pacifico", label: "Pacifico — Script Tebal Hangat", category: "Script Santai", isScript: true },
];

export const BIRTHDAY_BODY_FONT_OPTIONS: FontOption[] = [
  { id: "Plus Jakarta Sans", label: "Plus Jakarta Sans — Sans Korporat Bersih", category: "Modern Sans" },
  { id: "DM Sans", label: "DM Sans — Sans Modern Ringan", category: "Modern Sans" },
  { id: "Poppins", label: "Poppins — Sans Ceria & Ramah", category: "Modern Sans" },
  { id: "Montserrat", label: "Montserrat — Sans Eksekutif Rapi", category: "Modern Sans" },
  { id: "Space Grotesk", label: "Space Grotesk — Sans Kontemporer Unik", category: "Modern Sans" },
  { id: "Lora", label: "Lora — Serif Puitis Hangat", category: "Serif Formal" },
  { id: "Merriweather", label: "Merriweather — Serif Hangat Jelas", category: "Serif Formal" },
  { id: "Cormorant Garamond", label: "Cormorant Garamond — Serif Editorial Mewah", category: "Serif Formal" },
  { id: "Playfair Display", label: "Playfair Display — Serif Klasik Elegan", category: "Serif Formal" },
  { id: "DM Serif Display", label: "DM Serif Display — Serif Formal Tegas", category: "Serif Formal" },
  { id: "Cinzel", label: "Cinzel — Serif Korporat Kapital", category: "Serif Formal" },
  { id: "Kalam", label: "Kalam — Tulisan Tangan Hangat", category: "Script Santai", isScript: true },
  { id: "Caveat", label: "Caveat — Tulisan Tangan Santai", category: "Script Santai", isScript: true },
  { id: "Dancing Script", label: "Dancing Script — Script Ucapan Ekspresif", category: "Script Santai", isScript: true },
  { id: "Great Vibes", label: "Great Vibes — Kaligrafi Elegan", category: "Script Santai", isScript: true },
  { id: "Sacramento", label: "Sacramento — Script Signature Halus", category: "Script Santai", isScript: true },
  { id: "Pacifico", label: "Pacifico — Script Tebal Hangat", category: "Script Santai", isScript: true },
];

export const COMPANY_OPTIONS = [
  "PT Satoria Agro Industri",
  "PT Satoria Aneka Industri",
  "PT Satoria Pharma",
  "PT Satoria Distribusi Lestari",
] as const;

export const LOGO_SIZE_PRESETS = [
  { id: "small", label: "Kecil", scale: 0.75 },
  { id: "medium", label: "Sedang", scale: 1.0 },
  { id: "large", label: "Besar", scale: 1.6 },
  { id: "xl", label: "Ekstra", scale: 2.4 },
] as const;

export const WELCOME_THEMES: Array<{
  id: WelcomeTheme;
  label: string;
  swatchTop: string;
  swatchBottom: string;
}> = [
  {
    id: "ivory-gold",
    label: "Ivory Gold",
    swatchTop: "#C99E36",
    swatchBottom: "#FAF7F0",
  },
  {
    id: "navy-gold",
    label: "Navy Gold",
    swatchTop: "#0B1C2E",
    swatchBottom: "#173452",
  },
  {
    id: "pharma-mint",
    label: "Pharma Mint",
    swatchTop: "#0F766E",
    swatchBottom: "#E6F6F2",
  },
  {
    id: "warm-executive",
    label: "Warm Bronze",
    swatchTop: "#9A6B2F",
    swatchBottom: "#FBF4EB",
  },
];

export const BIRTHDAY_THEMES: Array<{
  id: BirthdayTheme;
  label: string;
  swatchTop: string;
  swatchBottom: string;
}> = [
  {
    id: "royal-gold",
    label: "Royal Gold",
    swatchTop: "#FCF8EE",
    swatchBottom: "#EAD9B7",
  },
  {
    id: "navy-gold",
    label: "Navy Gold",
    swatchTop: "#0B1C2E",
    swatchBottom: "#173452",
  },
  {
    id: "pharma-mint",
    label: "Pharma Mint",
    swatchTop: "#F1FAF7",
    swatchBottom: "#D1EDE6",
  },
  {
    id: "warm-festive",
    label: "Warm Festive",
    swatchTop: "#FFF8F0",
    swatchBottom: "#F6DEC7",
  },
];

export const AI_BG_PRESETS = {
  welcome: [
    {
      id: "batik-ivory",
      label: "Batik Emas Modern",
      prompt:
        "Latar putih gading bersih elegan dengan panel geometris motif batik emas kontemporer di sisi kiri dan aksen garis diagonal korporat modern.",
      suggestedTone: "dark" as AiTextTone,
    },
    {
      id: "marble-navy",
      label: "Navy & Emas Mewah",
      prompt:
        "Latar biru navy gelap korporat mewah dengan gradasi mendalam dan aksen garis geometris emas tipis di sudut.",
      suggestedTone: "light" as AiTextTone,
    },
    {
      id: "arch-minimal",
      label: "Arsitektur Minimalis",
      prompt:
        "Latar kantor modern minimalis berwarna abu-abu mutiara terang dengan faset geometris lembut dan aksen garis emas hangat.",
      suggestedTone: "dark" as AiTextTone,
    },
  ],
  birthday: [
    {
      id: "luxury-bokeh",
      label: "Bokeh Emas Mewah",
      prompt:
        "Latar perayaan korporat elegan berwarna krem champagne dengan cahaya bokeh emas lembut dan aksen pita geometris minimalis.",
      suggestedTone: "dark" as AiTextTone,
    },
    {
      id: "midnight-gala",
      label: "Midnight Gala",
      prompt:
        "Latar biru tengah malam mewah dengan partikel cahaya keemasan halus dan pola garis geometris elegan.",
      suggestedTone: "light" as AiTextTone,
    },
    {
      id: "floral-soft",
      label: "Botani Hangat",
      prompt:
        "Latar gradasi pastel hangat lembut dengan motif organik emas minimalis di pinggiran dan area kanan yang bersih terang.",
      suggestedTone: "dark" as AiTextTone,
    },
  ],
};

export const AI_PHOTO_PRESETS = [
  {
    id: "enhance",
    label: "Perjelas & Cerahkan",
    instruction:
      "Tingkatkan ketajaman detail wajah, resolusi gambar, dan cerahkan pencahayaan studio agar tampak lebih jernih, segar, dan profesional tanpa mengubah identitas wajah.",
  },
  {
    id: "formal-suit",
    label: "Ganti Jas Formal",
    instruction:
      "Ubah pakaian menjadi setelan jas kantor korporat formal yang rapi (jas gelap profesional dan kemeja putih/blazer formal rapi) tanpa mengubah wajah, ekspresi, maupun gaya rambut.",
  },
  {
    id: "clean-bg",
    label: "Rapikan Background",
    instruction:
      "Ganti latar belakang foto menjadi latar studio korporat polos berwarna abu-abu terang lembut yang bersih dan rapi dengan pencahayaan merata, pertahankan subjek asli secara utuh.",
  },
] as const;

export interface CardState {
  mode: CardMode;
  logoMode: LogoMode;
  customLogoDataUrl: string | null;
  logoScale: number;
  logoOffsetX: number;
  logoOffsetY: number;
  welcomeTheme: WelcomeTheme;
  birthdayTheme: BirthdayTheme;
  aiWelcomeBgDataUrl: string | null;
  aiBirthdayBgDataUrl: string | null;
  aiBgTextTone: AiTextTone;
  titleFont: CardFontId;
  nameFont: CardFontId;
  titleFontScale: number;
  nameFontScale: number;
  welcomeDataFont: CardFontId;
  welcomeDataFontScale: number;
  birthdayBodyFont: CardFontId;
  birthdayBodyFontScale: number;
  // Photo & adjustments
  originalPhotoDataUrl: string | null;
  currentPhotoDataUrl: string | null;
  photoZoom: number;
  photoOffsetX: number;
  photoOffsetY: number;
  // Welcome On Board fields
  welcomeName: string;
  companyOption: string;
  customCompanyName: string;
  position: string;
  joinDate: string;
  email: string;
  placement: string;
  // Happy Birthday fields
  birthdayName: string;
  age: string;
  showAge: boolean;
  birthdayPlacement: string;
  birthdayWish: string;
}
