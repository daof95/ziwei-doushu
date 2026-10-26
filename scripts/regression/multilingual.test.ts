import assert from 'node:assert/strict';
import { EMPTY_FORM, prepareBirth, BirthValidationError, isoDate } from '../../lib/i18n/birth';
import { LOCALES, isLocale } from '../../lib/i18n/locales';
import { messages } from '../../lib/i18n/messages';
import { PALACE_TERMS, STAR_THEMES, palaceName, starName } from '../../lib/i18n/terms';
import { generateChart } from '../../lib/ziwei/algorithm';
import { calculateTrueSolarTime, resolveZiweiDayOffset, shiftGregorianDate } from '../../lib/ziwei/true-solar-time';
import { buildStarSiHuaMap, getDaXianSiHua, getLiuNianSiHua } from '../../lib/ziwei/sihua';

const sample = { ...EMPTY_FORM, date: '1994-06-15', time: '08:30' };
const rejects = (form: typeof sample, code: string) => assert.throws(() => prepareBirth(form), error => error instanceof BirthValidationError && error.code === code);
assert.equal(isLocale('fr'), false);
assert.equal(isLocale('__proto__'), false);
assert.equal(LOCALES.length, 4);
for (const locale of LOCALES) {
  assert.deepEqual(Object.keys(messages[locale]).sort(), Object.keys(messages.en).sort());
  for (const text of Object.values(messages[locale])) assert.ok(text.trim());
  for (const term of Object.values(PALACE_TERMS)) assert.ok(term[locale]);
  for (const term of Object.values(STAR_THEMES)) assert.ok(term[locale]);
}
rejects({ ...sample, date: '1994-02-29' }, 'invalidDate');
rejects({ ...sample, date: '2000-02-30' }, 'invalidDate');
rejects({ ...sample, date: '1899-12-31' }, 'invalidDate');
rejects({ ...sample, date: '2051-01-01' }, 'invalidDate');
rejects({ ...sample, time: '' }, 'invalidTime');
rejects({ ...sample, time: '24:01' }, 'invalidTime');
rejects({ ...sample, mode: 'branch' }, 'invalidTime');
rejects({ ...sample, mode: 'branch', branch: '12' }, 'invalidTime');
rejects({ ...sample, solar: true }, 'invalidSolar');
rejects({ ...sample, solar: true, offset: '15', longitude: '0' }, 'invalidSolar');
rejects({ ...sample, solar: true, offset: '9', longitude: '181' }, 'invalidSolar');
assert.equal(prepareBirth({ ...sample, date: '2000-02-29' }).info.day, 29);
assert.equal(prepareBirth({ ...sample, time: '23:30' }).info.day, 16);
assert.equal(prepareBirth({ ...sample, time: '23:30', late: 'current-day' }).info.day, 15);
assert.equal(isoDate(prepareBirth({ ...sample, date: '1999-12-31', time: '23:30' }).info), '2000-01-01');
assert.equal(prepareBirth({ ...sample, mode: 'branch', branch: '0' }).info.day, 15, 'already-corrected branch mode must not apply late Zi twice');
assert.equal(prepareBirth({ ...sample, name: '  Ana  ' }).info.name, 'Ana');

// Same UTC+8 math as the existing solar helper, including date changes.
let solarCases = 0;
for (const date of ['1994-06-15', '2000-02-29', '2026-12-31']) {
  for (const time of ['00:01', '08:30', '22:59', '23:59']) {
    for (const longitude of [-170, 0, 73.5, 120, 139.7, 179]) {
      const [year, month, day] = date.split('-').map(Number);
      const [clockHour, clockMinute] = time.split(':').map(Number);
      const solar = calculateTrueSolarTime({ year, month, day, clockHour, clockMinute, longitude });
      const expectedDate = shiftGregorianDate({ year, month, day }, resolveZiweiDayOffset(solar));
      const prepared = prepareBirth({ ...sample, date, time, solar: true, offset: '8', longitude: String(longitude) });
      assert.equal(isoDate(prepared.info), isoDate(expectedDate));
      assert.equal(prepared.info.hour, solar.branch);
      solarCases++;
    }
  }
}
// Tokyo summer, New York winter/summer offsets and international date line.
assert.equal(prepareBirth({ ...sample, solar: true, offset: '9', longitude: '135' }).info.hour, prepareBirth({ ...sample, solar: true, offset: '8', longitude: '120' }).info.hour);
const winter = prepareBirth({ ...sample, date: '1994-01-15', time: '10:30', solar: true, offset: '-5', longitude: '-75' });
const summer = prepareBirth({ ...sample, date: '1994-01-15', time: '11:30', solar: true, offset: '-4', longitude: '-75' });
assert.equal(winter.info.hour, summer.info.hour);
assert.equal(isoDate(prepareBirth({ ...sample, time: '01:00', solar: true, offset: '14', longitude: '-157', late: 'current-day' }).info), '1994-06-14');
assert.equal(isoDate(prepareBirth({ ...sample, time: '00:05', solar: true, offset: '14', longitude: '-157', late: 'current-day' }).info), '1994-06-13', 'solar date can be two dates behind the civil date near the international date line');
rejects({ ...sample, date: '2050-12-31', time: '23:30' }, 'invalidDate');

// Locale is presentation only: translation must not mutate raw engine data.
const birth = prepareBirth(sample).info;
const reference = generateChart(birth);
const canonical = (chart: typeof reference) => JSON.stringify({ birth: chart.birthInfo, lunar: chart.lunarInfo, palaces: chart.palaces, daxians: chart.daXians });
const baseline = canonical(reference);
for (const locale of LOCALES) {
  for (const palace of reference.palaces) {
    assert.ok(PALACE_TERMS[palace.name] ?? PALACE_TERMS[`${palace.name}宫`], `Unmapped palace ${palace.name}`);
    palaceName(palace.name, locale);
    palace.stars.forEach(star => starName(star.name, locale));
  }
  assert.equal(canonical(reference), baseline);
  assert.equal(canonical(generateChart(birth)), baseline);
}
const annual = getLiuNianSiHua(2026);
const decade = getDaXianSiHua(reference, 0)!;
assert.equal(Object.keys(annual.transforms).length, 4);
assert.equal(Object.keys(buildStarSiHuaMap(decade.stemIndex)).length, 4);
assert.notDeepEqual(getLiuNianSiHua(2027).transforms, annual.transforms);
console.log(`PASS: four complete locales; validation; ${solarCases} solar/date parity cases; overseas offsets; immutable chart presentation; annual/decade transformations`);
