import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, LANGUAGE_TAGS, LOCALES } from '@/lib/i18n/locales';
import { messages } from '@/lib/i18n/messages';
import MultilingualChart from '@/components/i18n/MultilingualChart';

export function generateStaticParams() { return LOCALES.map(locale => ({ locale })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = messages[locale];
  return {
    title: `${m.title} · ${m.subtitle}`,
    description: m.intro,
    alternates: { canonical: `/${locale}`, languages: Object.fromEntries(LOCALES.map(l => [LANGUAGE_TAGS[l], `/${l}`])) },
    openGraph: { title: m.title, description: m.intro, url: `/${locale}`, locale: LANGUAGE_TAGS[locale].replace('-', '_') },
  };
}
export default async function InternationalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <MultilingualChart locale={locale} />;
}
