'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useInternationalState } from './InternationalProvider';
import { EMPTY_FORM, BirthValidationError, prepareBirth, isoDate, type InternationalBirthForm } from '@/lib/i18n/birth';
import { LANGUAGE_NAMES, LANGUAGE_TAGS, LOCALES, type Locale } from '@/lib/i18n/locales';
import { messages } from '@/lib/i18n/messages';
import { BRANCH_ROMAN, STEM_ROMAN, ELEMENT_TERMS, BRIGHTNESS_TERMS, TRANSFORM_TERMS, STAR_THEMES, palaceName, starName } from '@/lib/i18n/terms';
import { BRANCHES, STEMS, SHICHEN } from '@/lib/ziwei/constants';
import { generateChart } from '@/lib/ziwei/algorithm';
import { buildStarSiHuaMap, getDaXianSiHua, getLiuNianSiHua } from '@/lib/ziwei/sihua';
import type { Star } from '@/lib/ziwei/types';
import styles from './international.module.css';

const ORDER = [5, 6, 7, 8, 4, 9, 3, 10, 2, 1, 0, 11];
const POSITIONS = [[1,1],[1,2],[1,3],[1,4],[2,1],[2,4],[3,1],[3,4],[4,1],[4,2],[4,3],[4,4]];
type View = 'natal' | 'decade' | 'annual';

export default function MultilingualChart({ locale }: { locale: Locale }) {
  const m = messages[locale];
  const { form, setForm, result, setResult } = useInternationalState();
  const { toggle } = useTheme();
  const [error, setError] = useState<keyof typeof m | null>(null);
  const [view, setView] = useState<View>('natal');
  const [dxIndex, setDxIndex] = useState(0);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [selected, setSelected] = useState<number | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { document.documentElement.lang = LANGUAGE_TAGS[locale]; }, [locale]);
  const update = <K extends keyof InternationalBirthForm>(key: K, value: InternationalBirthForm[K]) => {
    setForm(previous => ({ ...previous, [key]: value })); setError(null);
  };
  function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const birth = prepareBirth(form);
      const chart = generateChart(birth.info);
      setResult({ birth, chart });
      setSelected(chart.mingGongBranch); setView('natal');
      setDxIndex(Math.max(0, chart.currentDaXianIndex)); setError(null);
      requestAnimationFrame(() => resultHeading.current?.focus());
    } catch (err) {
      setError(err instanceof BirthValidationError ? err.code : 'failed');
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }
  const chart = result?.chart;
  const palace = chart?.palaces.find(p => p.branch === selected);
  const sihua = chart ? view === 'decade' ? getDaXianSiHua(chart, dxIndex) : view === 'annual' ? getLiuNianSiHua(year) : null : null;
  const overlay = sihua ? buildStarSiHuaMap(sihua.stemIndex) : {};
  const branchLabel = (n: number) => `${BRANCH_ROMAN[n]} · ${BRANCHES[n]}`;
  const starLabel = (star: Star) => <>
    <span>{starName(star.name, locale)}</span>
    {star.brightnessRaw && <small>{m.brightness}: {BRIGHTNESS_TERMS[star.brightnessRaw]?.[locale] ?? star.brightnessRaw}</small>}
    {star.siHua && <span className={styles.natal} data-transform="natal">{m.natalMark}: {TRANSFORM_TERMS[star.siHua]?.[locale] ?? star.siHua}</span>}
    {overlay[star.name] && <span className={styles.overlay} data-transform="overlay">{m.overlayMark}: {TRANSFORM_TERMS[overlay[star.name]][locale]}</span>}
  </>;
  return <main lang={LANGUAGE_TAGS[locale]} className={styles.page}>
    <a className={styles.skip} href="#birth-workspace">{m.birth}</a>
    <header className={styles.header}>
      <Link href={`/${locale}`} className={styles.brand}>紫微 <span>ZI WEI</span></Link>
      <nav aria-label={m.language} className={styles.languages}>
        {LOCALES.map(l => <Link key={l} href={`/${l}`} hrefLang={LANGUAGE_TAGS[l]} lang={LANGUAGE_TAGS[l]} aria-current={locale === l ? 'page' : undefined}>{LANGUAGE_NAMES[l]}</Link>)}
      </nav>
      <button type="button" onClick={toggle} aria-label={m.theme} title={m.theme} className={styles.theme}>◐</button>
    </header>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>ZI WEI DOU SHU · 紫微斗数</p>
      <h1>{m.subtitle}</h1><p>{m.intro}</p>
    </section>
    <section id="birth-workspace" className={styles.workspace}>
      {!result ? <div className={styles.formLayout}>
        <form onSubmit={submit} noValidate className={styles.card}>
          <h2 ref={formHeading} tabIndex={-1}>{m.birth}</h2>
          <p className={styles.muted}>{m.unknown}</p>
          {error && <p ref={errorRef} tabIndex={-1} role="alert" className={styles.error}>{m[error]}</p>}
          <label>{m.name}<input name="name" autoComplete="off" maxLength={80} value={form.name} onChange={e => update('name', e.target.value)} /></label>
          <div className={styles.twoColumns}>
            <label>{m.date}<input name="date" type="date" min="1900-01-01" max="2050-12-31" required aria-invalid={error === 'invalidDate'} value={form.date} onChange={e => update('date', e.target.value)} /></label>
            <label>{m.gender}<select name="gender" value={form.gender} onChange={e => update('gender', e.target.value as 'male' | 'female')}><option value="male">{m.male}</option><option value="female">{m.female}</option></select></label>
          </div>
          <label>{m.mode}<select name="mode" value={form.mode} onChange={e => update('mode', e.target.value as 'clock' | 'branch')}><option value="clock">{m.clock}</option><option value="branch">{m.branch}</option></select></label>
          {form.mode === 'clock' ? <>
            <label>{m.time}<input name="time" type="time" required value={form.time} aria-invalid={error === 'invalidTime'} onChange={e => update('time', e.target.value)} /></label>
            <label className={styles.check}><input name="solar" type="checkbox" checked={form.solar} onChange={e => update('solar', e.target.checked)} />{m.solar}</label>
            <p className={styles.muted} id="solar-help">{m.solarHelp}</p>
            {form.solar && <div className={styles.twoColumns}>
              <label>{m.offset}<input name="offset" type="number" step="any" min="-12" max="14" required aria-describedby="solar-help" value={form.offset} onChange={e => update('offset', e.target.value)} /></label>
              <label>{m.longitude}<input name="longitude" type="number" step="any" min="-180" max="180" required aria-describedby="solar-help" value={form.longitude} onChange={e => update('longitude', e.target.value)} /></label>
            </div>}
            <label>{m.late}<select name="late" value={form.late} onChange={e => update('late', e.target.value as InternationalBirthForm['late'])}><option value="next-day">{m.nextDay}</option><option value="current-day">{m.sameDay}</option></select></label>
          </> : <>
            <p className={styles.muted}>{m.periodHelp}</p>
            <label>{m.branch}<select name="branch" value={form.branch} onChange={e => update('branch', e.target.value)} required><option value="">—</option>{SHICHEN.map((period, index) => <option value={index} key={index}>{branchLabel(index)} · {period.range}</option>)}</select></label>
          </>}
          <button type="submit" className={styles.primary}>{m.generate} →</button>
          <p className={styles.muted}>{m.privacy}</p>
        </form>
        <aside className={styles.guide}><h2>{m.glossary}</h2><p>{m.glossaryIntro}</p>
          {(['ming', 'shen', 'sihua', 'daxian'] as const).map(key => <article key={key}><h3>{m[`${key}t`]}</h3><p>{m[`${key}Help`]}</p></article>)}
        </aside>
      </div> : <>
        <div className={styles.actions}>
          <h2 tabIndex={-1} ref={resultHeading}>{m.chart}{chart?.birthInfo.name ? ` · ${chart.birthInfo.name}` : ''}</h2>
          <button type="button" onClick={() => { setResult(null); requestAnimationFrame(() => formHeading.current?.focus()); }}>{m.edit}</button>
          <button type="button" onClick={() => { setResult(null); setForm({ ...EMPTY_FORM }); setError(null); requestAnimationFrame(() => formHeading.current?.focus()); }}>{m.clear}</button>
        </div>
        {chart && <>
          <dl className={styles.summary}>
            <div><dt>{m.chartDate}</dt><dd>{isoDate(result.birth.info)}</dd></div>
            <div><dt>{m.correctedTime}</dt><dd>{result.birth.clock ?? branchLabel(chart.birthInfo.hour)} · {branchLabel(chart.birthInfo.hour)}</dd></div>
            <div><dt>{m.lunar}</dt><dd>{chart.lunarInfo.lunarYear} / {Math.abs(chart.lunarInfo.lunarMonth)} / {chart.lunarInfo.lunarDay}{chart.lunarInfo.isLeapMonth ? ` · ${m.leap}` : ''}</dd></div>
            <div><dt>{m.element}</dt><dd>{ELEMENT_TERMS[chart.wuxingJu]?.[locale] ?? chart.wuxingJuName}</dd></div>
          </dl>
          <div className={styles.toolbar} role="group" aria-label={m.chart}>
            {(['natal', 'decade', 'annual'] as const).map(v => <button type="button" aria-pressed={view === v} key={v} onClick={() => setView(v)}>{m[v]}</button>)}
            {view === 'decade' && <label>{m.decadeSelect}<select value={dxIndex} onChange={e => setDxIndex(Number(e.target.value))}>{chart.daXians.map((dx, index) => <option key={index} value={index}>{m.age} {dx.startAge}–{dx.endAge} · {palaceName(dx.palaceName, locale)}</option>)}</select></label>}
            {view === 'annual' && <label>{m.year}<select value={year} onChange={e => setYear(Number(e.target.value))}>{Array.from({ length: 151 }, (_, n) => 1900 + n).map(y => <option key={y}>{y}</option>)}</select></label>}
          </div>
          <p className={styles.muted}>{m.periodNote}</p>
          <div className={styles.resultsLayout}>
            <section aria-label={m.chart} className={styles.board}>
              {ORDER.map((branch, index) => {
                const p = chart.palaces.find(p => p.branch === branch)!;
                return <button type="button" key={branch} data-palace={branch} aria-pressed={selected === branch} onClick={() => setSelected(branch)} className={styles.palace} style={{ gridRow: POSITIONS[index][0], gridColumn: POSITIONS[index][1] }}>
                  <strong>{palaceName(p.name, locale)}</strong>
                  <small>{STEM_ROMAN[p.stem]} {BRANCH_ROMAN[branch]} · {STEMS[p.stem]}{BRANCHES[branch]}</small>
                  {p.isShenGong && <span className={styles.body}>{m.body}</span>}
                  {p.stars.filter(s => s.type === 'major').map(star => <span key={star.name} className={styles.star}>{starLabel(star)}</span>)}
                  {!p.stars.some(s => s.type === 'major') && <small>{m.empty}</small>}
                  <small>{m.age} {p.daXianAge?.join('–')}</small>
                  {view === 'decade' && chart.daXians[dxIndex]?.palaceBranch === branch && <span className={styles.overlay}>{m.decade}</span>}
                </button>;
              })}
              <div className={styles.center}><span className={styles.seal}>紫微</span><p>{m.title}</p><p>{m.select}</p></div>
            </section>
            <aside className={`${styles.card} ${styles.details}`} aria-label={m.selected} aria-live="polite">
              <h3>{palace ? palaceName(palace.name, locale) : m.selected}</h3><p className={styles.muted}>{m.glossaryIntro}</p>
              {palace && <>
                <h4>{m.major}</h4>
                {palace.stars.filter(s => s.type === 'major').map(star => <article key={star.name}><div className={styles.star}>{starLabel(star)}</div><p>{STAR_THEMES[star.name]?.[locale]}</p></article>)}
                {palace.isEmpty && <p>{m.empty}. {m.borrowed}: {palace.borrowedStars?.map(n => starName(n, locale)).join(' · ') || '—'}</p>}
                <h4>{m.other}</h4><ul>{palace.stars.filter(s => s.type !== 'major').map(star => <li key={star.name} className={styles.star}>{starLabel(star)}</li>)}</ul>
              </>}
              <h4>{m.transformations}</h4><ul>{Object.entries(TRANSFORM_TERMS).map(([key, value]) => <li key={key}>{value[locale]}</li>)}</ul>
            </aside>
          </div>
        </>}
      </>}
    </section>
    <footer className={styles.footer}>
      <h2>{m.sources}</h2><p>{m.sourceNote}</p>
      <div className={styles.links}><Link href="/knowledge" hrefLang="zh-CN">{m.knowledge} ↗</Link><Link href="/library" hrefLang="zh-CN">{m.library} ↗</Link><Link href="/">{m.original} ↗</Link><a href="https://github.com/Renhuai123/ziwei-doushu">GitHub · MIT ↗</a></div>
      <p>{m.attribution}</p><p>{m.disclaimer}</p>
    </footer>
  </main>;
}
