export const LOCALES = ['zh', 'en', 'es', 'ja'] as const;
export type Locale = typeof LOCALES[number];
export const LANGUAGE_NAMES: Record<Locale, string> = { zh: '简体中文', en: 'English', es: 'Español', ja: '日本語' };
export const LANGUAGE_TAGS: Record<Locale, string> = { zh: 'zh-CN', en: 'en', es: 'es', ja: 'ja' };
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
