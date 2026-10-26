'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isLocale, LANGUAGE_NAMES, LOCALES } from '@/lib/i18n/locales';

export default function LegacyLanguages() {
  const path = usePathname();
  const international = isLocale(path.split('/')[1] ?? '');
  useEffect(() => { if (!international) document.documentElement.lang = 'zh-CN'; }, [international]);
  if (international) return null;
  return <nav aria-label="语言 / Language" style={{ position: 'fixed', bottom: 12, right: 12, zIndex: 100, display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: 'calc(100vw - 24px)', padding: '10px 16px', borderRadius: 16, background: 'var(--bg-1)', border: '1px solid var(--bdr-heavy)', boxShadow: 'var(--sh-md)', fontSize: 13 }}>
    {LOCALES.map(locale => <Link key={locale} href={`/${locale}`} hrefLang={locale}>{LANGUAGE_NAMES[locale]}</Link>)}
  </nav>;
}
