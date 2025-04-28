import axios from "axios";
import { useEffect, useState, useRef } from "react";

interface Translations {
  [key: string]: string;
}

interface GeoLocation {
  country_code: string;
}

const countryToLanguage: { [key: string]: string } = {
  AE: "ar",
  AL: "sq",
  AM: "hy",
  AR: "ar",
  AT: "de",
  AU: "en",
  AZ: "az",
  BD: "bn",
  BE: "nl",
  BG: "bg",
  BH: "ar",
  BR: "pt",
  CA: "en",
  CH: "de",
  CL: "es",
  CN: "zh",
  CO: "es",
  CZ: "cs",
  DE: "de",
  DK: "da",
  EE: "et",
  ES: "es",
  ET: "am",
  FI: "fi",
  FO: "fo",
  FR: "fr",
  GB: "en",
  GE: "ka",
  GL: "kl",
  GR: "el",
  HK: "zh",
  HR: "hr",
  HU: "hu",
  ID: "id",
  IL: "he",
  IN: "hi",
  IR: "fa",
  IS: "is",
  IT: "it",
  JP: "ja",
  KE: "sw",
  KG: "ky",
  KH: "km",
  KR: "ko",
  KW: "ar",
  KZ: "kk",
  LA: "lo",
  LK: "si",
  LT: "lt",
  LV: "lv",
  MM: "my",
  MN: "mn",
  MO: "zh",
  MT: "mt",
  MX: "es",
  MY: "ms",
  NG: "ha",
  NL: "nl",
  NO: "no",
  NP: "ne",
  OM: "ar",
  PE: "es",
  PH: "tl",
  PK: "ur",
  PL: "pl",
  PR: "es",
  PT: "pt",
  QA: "ar",
  RO: "ro",
  RS: "sr",
  RU: "ru",
  RW: "rw",
  SA: "ar",
  SE: "sv",
  SG: "zh-SG",
  SK: "sk",
  SO: "so",
  TH: "th",
  TJ: "tg",
  TR: "tr",
  TW: "zh",
  TZ: "sw",
  UA: "uk",
  US: "en",
  UY: "es",
  UZ: "uz",
  VE: "es",
  VN: "vi",
  ZA: "zu",
};

const TRANSLATION_CACHE_KEY = "translationCache";

export const useTranslation = (textsToTranslate: { [key: string]: string }) => {
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevTextsRef = useRef<string>("");

  const translateText = async (text: string, targetLang: string) => {
    try {
      const response = await axios.get<any>(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
      );
      return response.data[0][0][0];
    } catch (error) {
      console.error("Error translating text:", error);
      return text;
    }
  };

  useEffect(() => {
    const currentTexts = JSON.stringify(textsToTranslate);
    if (currentTexts === prevTextsRef.current) {
      return;
    }
    prevTextsRef.current = currentTexts;

    const translate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const geoData = localStorage.getItem("geoData");
        if (!geoData) {
          setIsLoading(false);
          return;
        }

        const { country_code } = JSON.parse(geoData) as GeoLocation;
        const targetLang = countryToLanguage[country_code] || "en";

        if (targetLang === "en") {
          setIsLoading(false);
          return;
        }

        const cacheKey = `${targetLang}_${currentTexts}`;
        const cachedTranslations = localStorage.getItem(TRANSLATION_CACHE_KEY);
        if (cachedTranslations) {
          const cache = JSON.parse(cachedTranslations);
          if (cache[cacheKey]) {
            setTranslations(cache[cacheKey]);
            setIsLoading(false);
            return;
          }
        }

        const translatedTexts: Translations = {};
        for (const [key, text] of Object.entries(textsToTranslate)) {
          translatedTexts[key] = await translateText(text, targetLang);
        }

        const cache = cachedTranslations ? JSON.parse(cachedTranslations) : {};
        cache[cacheKey] = translatedTexts;
        localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));

        setTranslations(translatedTexts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi dịch văn bản");
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [textsToTranslate]);

  const t = (key: string): string => {
    return translations[key] || textsToTranslate[key] || key;
  };

  return { t, isLoading, error };
};
