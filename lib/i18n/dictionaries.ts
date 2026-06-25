import { en } from "./dictionaries/en"
import { es } from "./dictionaries/es"
import { fr } from "./dictionaries/fr"
import { zh } from "./dictionaries/zh"
import { yue } from "./dictionaries/yue"
import { hi } from "./dictionaries/hi"
import { pa } from "./dictionaries/pa"
import { tl } from "./dictionaries/tl"
import { ko } from "./dictionaries/ko"
import { ja } from "./dictionaries/ja"
import { ru } from "./dictionaries/ru"
import { uk } from "./dictionaries/uk"
import { ar } from "./dictionaries/ar"
import { fa } from "./dictionaries/fa"
import type { Locale } from "./config"

export type Dictionary = typeof en

// Non-English dictionaries may be partially translated; missing keys fall back
// to English at lookup time (see language-context). The cast keeps the map typed
// without requiring every locale to be 100% complete at compile time.
export const dictionaries: Record<Locale, Dictionary> = {
  en,
  es: es as Dictionary,
  fr: fr as Dictionary,
  zh: zh as Dictionary,
  yue: yue as Dictionary,
  hi: hi as Dictionary,
  pa: pa as Dictionary,
  tl: tl as Dictionary,
  ko: ko as Dictionary,
  ja: ja as Dictionary,
  ru: ru as Dictionary,
  uk: uk as Dictionary,
  ar: ar as Dictionary,
  fa: fa as Dictionary,
}
