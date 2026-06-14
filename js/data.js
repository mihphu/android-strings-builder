// =============================================================
//  Android locale catalogue
//  ------------------------------------------------------------
//  Each entry maps to an Android resource directory:
//      folder name = "values-" + id      (e.g. values-es-rES)
//
//  Fields
//      id     : resource qualifier "<code>-r<REGION>"  (e.g. "es-rES")
//      code   : ISO 639-1 language code (lowercase)
//      region : ISO 3166-1 alpha-2 country code (uppercase)
//               -> also drives the flag (flag-icons class "fi fi-<region lowercased>")
//      name   : human-readable label shown in the UI
//      flag   : emoji fallback (the UI renders flag-icons SVG, not this)
//
//  Note on legacy language codes
//  ------------------------------------------------------------
//  Android/Java resolve a few languages by their historical ISO codes,
//  so the resource folders below use:
//      Indonesian -> "in"  (modern "id")
//      Hebrew     -> "iw"  (modern "he")
//  If your toolchain / minSdk expects the modern codes, edit them here.
//  This list is plain data — add, remove, or reorder freely.
// =============================================================

const LANGUAGES = [
  { id: 'sq-rAL', code: 'sq',  region: 'AL', name: 'Albanian',              flag: '🇦🇱' },
  { id: 'am-rET', code: 'am',  region: 'ET', name: 'Amharic',               flag: '🇪🇹' },
  { id: 'ar-rSA', code: 'ar',  region: 'SA', name: 'Arabic',                flag: '🇸🇦' },
  { id: 'hy-rAM', code: 'hy',  region: 'AM', name: 'Armenian',              flag: '🇦🇲' },
  { id: 'az-rAZ', code: 'az',  region: 'AZ', name: 'Azerbaijani',           flag: '🇦🇿' },
  { id: 'bn-rBD', code: 'bn',  region: 'BD', name: 'Bengali',               flag: '🇧🇩' },
  { id: 'bg-rBG', code: 'bg',  region: 'BG', name: 'Bulgarian',             flag: '🇧🇬' },
  { id: 'my-rMM', code: 'my',  region: 'MM', name: 'Burmese',               flag: '🇲🇲' },
  { id: 'zh-rCN', code: 'zh',  region: 'CN', name: 'Chinese (Simplified)',  flag: '🇨🇳' },
  { id: 'zh-rTW', code: 'zh',  region: 'TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { id: 'hr-rHR', code: 'hr',  region: 'HR', name: 'Croatian',              flag: '🇭🇷' },
  { id: 'cs-rCZ', code: 'cs',  region: 'CZ', name: 'Czech',                 flag: '🇨🇿' },
  { id: 'da-rDK', code: 'da',  region: 'DK', name: 'Danish',                flag: '🇩🇰' },
  { id: 'nl-rNL', code: 'nl',  region: 'NL', name: 'Dutch',                 flag: '🇳🇱' },
  { id: 'en-rGB', code: 'en',  region: 'GB', name: 'English (UK)',          flag: '🇬🇧' },
  { id: 'en-rUS', code: 'en',  region: 'US', name: 'English (US)',          flag: '🇺🇸' },
  { id: 'et-rEE', code: 'et',  region: 'EE', name: 'Estonian',              flag: '🇪🇪' },
  { id: 'fil-rPH',code: 'fil', region: 'PH', name: 'Filipino',              flag: '🇵🇭' },
  { id: 'fi-rFI', code: 'fi',  region: 'FI', name: 'Finnish',               flag: '🇫🇮' },
  { id: 'fr-rFR', code: 'fr',  region: 'FR', name: 'French',                flag: '🇫🇷' },
  { id: 'ka-rGE', code: 'ka',  region: 'GE', name: 'Georgian',              flag: '🇬🇪' },
  { id: 'de-rDE', code: 'de',  region: 'DE', name: 'German',                flag: '🇩🇪' },
  { id: 'el-rGR', code: 'el',  region: 'GR', name: 'Greek',                 flag: '🇬🇷' },
  { id: 'gu-rIN', code: 'gu',  region: 'IN', name: 'Gujarati',              flag: '🇮🇳' },
  { id: 'iw-rIL', code: 'iw',  region: 'IL', name: 'Hebrew',                flag: '🇮🇱' },
  { id: 'hi-rIN', code: 'hi',  region: 'IN', name: 'Hindi',                 flag: '🇮🇳' },
  { id: 'hu-rHU', code: 'hu',  region: 'HU', name: 'Hungarian',             flag: '🇭🇺' },
  { id: 'in-rID', code: 'in',  region: 'ID', name: 'Indonesian',            flag: '🇮🇩' },
  { id: 'it-rIT', code: 'it',  region: 'IT', name: 'Italian',               flag: '🇮🇹' },
  { id: 'ja-rJP', code: 'ja',  region: 'JP', name: 'Japanese',              flag: '🇯🇵' },
  { id: 'kn-rIN', code: 'kn',  region: 'IN', name: 'Kannada',               flag: '🇮🇳' },
  { id: 'kk-rKZ', code: 'kk',  region: 'KZ', name: 'Kazakh',                flag: '🇰🇿' },
  { id: 'km-rKH', code: 'km',  region: 'KH', name: 'Khmer',                 flag: '🇰🇭' },
  { id: 'ko-rKR', code: 'ko',  region: 'KR', name: 'Korean',                flag: '🇰🇷' },
  { id: 'lv-rLV', code: 'lv',  region: 'LV', name: 'Latvian',               flag: '🇱🇻' },
  { id: 'lt-rLT', code: 'lt',  region: 'LT', name: 'Lithuanian',            flag: '🇱🇹' },
  { id: 'mk-rMK', code: 'mk',  region: 'MK', name: 'Macedonian',            flag: '🇲🇰' },
  { id: 'ms-rMY', code: 'ms',  region: 'MY', name: 'Malay',                 flag: '🇲🇾' },
  { id: 'ml-rIN', code: 'ml',  region: 'IN', name: 'Malayalam',             flag: '🇮🇳' },
  { id: 'mr-rIN', code: 'mr',  region: 'IN', name: 'Marathi',               flag: '🇮🇳' },
  { id: 'ne-rNP', code: 'ne',  region: 'NP', name: 'Nepali',                flag: '🇳🇵' },
  { id: 'nb-rNO', code: 'nb',  region: 'NO', name: 'Norwegian Bokmål',      flag: '🇳🇴' },
  { id: 'fa-rIR', code: 'fa',  region: 'IR', name: 'Persian',               flag: '🇮🇷' },
  { id: 'pl-rPL', code: 'pl',  region: 'PL', name: 'Polish',                flag: '🇵🇱' },
  { id: 'pt-rBR', code: 'pt',  region: 'BR', name: 'Portuguese (Brazil)',   flag: '🇧🇷' },
  { id: 'pt-rPT', code: 'pt',  region: 'PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
  { id: 'pa-rIN', code: 'pa',  region: 'IN', name: 'Punjabi',               flag: '🇮🇳' },
  { id: 'ro-rRO', code: 'ro',  region: 'RO', name: 'Romanian',              flag: '🇷🇴' },
  { id: 'ru-rRU', code: 'ru',  region: 'RU', name: 'Russian',               flag: '🇷🇺' },
  { id: 'sr-rRS', code: 'sr',  region: 'RS', name: 'Serbian',               flag: '🇷🇸' },
  { id: 'si-rLK', code: 'si',  region: 'LK', name: 'Sinhala',               flag: '🇱🇰' },
  { id: 'sk-rSK', code: 'sk',  region: 'SK', name: 'Slovak',                flag: '🇸🇰' },
  { id: 'sl-rSI', code: 'sl',  region: 'SI', name: 'Slovenian',             flag: '🇸🇮' },
  { id: 'es-rES', code: 'es',  region: 'ES', name: 'Spanish (Spain)',       flag: '🇪🇸' },
  { id: 'es-rMX', code: 'es',  region: 'MX', name: 'Spanish (Mexico)',      flag: '🇲🇽' },
  { id: 'sw-rKE', code: 'sw',  region: 'KE', name: 'Swahili',               flag: '🇰🇪' },
  { id: 'sv-rSE', code: 'sv',  region: 'SE', name: 'Swedish',               flag: '🇸🇪' },
  { id: 'ta-rIN', code: 'ta',  region: 'IN', name: 'Tamil',                 flag: '🇮🇳' },
  { id: 'te-rIN', code: 'te',  region: 'IN', name: 'Telugu',                flag: '🇮🇳' },
  { id: 'th-rTH', code: 'th',  region: 'TH', name: 'Thai',                  flag: '🇹🇭' },
  { id: 'tr-rTR', code: 'tr',  region: 'TR', name: 'Turkish',               flag: '🇹🇷' },
  { id: 'uk-rUA', code: 'uk',  region: 'UA', name: 'Ukrainian',             flag: '🇺🇦' },
  { id: 'ur-rPK', code: 'ur',  region: 'PK', name: 'Urdu',                  flag: '🇵🇰' },
  { id: 'uz-rUZ', code: 'uz',  region: 'UZ', name: 'Uzbek',                 flag: '🇺🇿' },
  { id: 'vi-rVN', code: 'vi',  region: 'VN', name: 'Vietnamese',            flag: '🇻🇳' },
];
