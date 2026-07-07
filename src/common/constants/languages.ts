export interface LanguageOption {
  label: string;
  language_code: string;
}

export const LANGUAGES: LanguageOption[] = [
  { label: 'English', language_code: 'en' },
  { label: 'Spanish', language_code: 'es' },
  { label: 'German', language_code: 'de' },
  { label: 'French', language_code: 'fr' },
  { label: 'Italian', language_code: 'it' },
  { label: 'Portuguese', language_code: 'pt' },
  { label: 'Dutch', language_code: 'nl' },
  { label: 'Russian', language_code: 'ru' },
  { label: 'Japanese', language_code: 'ja' },
  { label: 'Korean', language_code: 'ko' },
  { label: 'Chinese (Simplified)', language_code: 'zh_CN' },
  { label: 'Chinese (Traditional)', language_code: 'zh_TW' },
  { label: 'Arabic', language_code: 'ar' },
  { label: 'Hindi', language_code: 'hi' },
  { label: 'Turkish', language_code: 'tr' },
  { label: 'Polish', language_code: 'pl' },
  { label: 'Swedish', language_code: 'sv' },
  { label: 'Danish', language_code: 'da' },
  { label: 'Finnish', language_code: 'fi' },
  { label: 'Norwegian', language_code: 'nb' },
  { label: 'Greek', language_code: 'el' },
  { label: 'Thai', language_code: 'th' },
  { label: 'Vietnamese', language_code: 'vi' },
  { label: 'Indonesian', language_code: 'id' },
  { label: 'Hebrew', language_code: 'he' },
  { label: 'Czech', language_code: 'cs' },
  { label: 'Romanian', language_code: 'ro' },
  { label: 'Hungarian', language_code: 'hu' },
  { label: 'Ukrainian', language_code: 'uk' },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.language_code);
