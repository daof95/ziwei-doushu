import type { Locale } from './locales';

// Display-only terminology. Never translate identifiers passed to the engine.
type Term = Record<Locale, string>;
const term = (zh: string, en: string, es: string, ja: string): Term => ({ zh, en, es, ja });
export const PALACE_TERMS: Record<string, Term> = {
  命宫: term('命宫', 'Life', 'Vida', '命宮'),
  兄弟宫: term('兄弟宫', 'Siblings', 'Hermanos', '兄弟宮'),
  夫妻宫: term('夫妻宫', 'Partner', 'Pareja', '夫妻宮'),
  子女宫: term('子女宫', 'Children', 'Hijos', '子女宮'),
  财帛宫: term('财帛宫', 'Wealth', 'Recursos', '財帛宮'),
  疾厄宫: term('疾厄宫', 'Health', 'Salud', '疾厄宮'),
  迁移宫: term('迁移宫', 'Travel & environment', 'Viajes y entorno', '遷移宮'),
  交友宫: term('交友宫', 'Friends', 'Amistades', '交友宮'),
  仆役宫: term('仆役宫', 'Friends', 'Amistades', '交友宮'),
  官禄宫: term('官禄宫', 'Career', 'Carrera', '官禄宮'),
  田宅宫: term('田宅宫', 'Home & property', 'Hogar y patrimonio', '田宅宮'),
  福德宫: term('福德宫', 'Inner well-being', 'Bienestar interior', '福徳宮'),
  父母宫: term('父母宫', 'Parents', 'Padres', '父母宮'),
};
export function palaceName(name: string, locale: Locale): string {
  // iztro returns short names (e.g. 父母); other engine consumers use 父母宫.
  return (PALACE_TERMS[name] ?? PALACE_TERMS[`${name}宫`])?.[locale] ?? name;
}
export const TRANSFORM_TERMS: Record<string, Term> = {
  禄: term('禄·资源', 'Lu · Resources', 'Lu · Recursos', '禄・資源'),
  权: term('权·权威', 'Quan · Authority', 'Quan · Autoridad', '権・権威'),
  科: term('科·名誉', 'Ke · Recognition', 'Ke · Reconocimiento', '科・評価'),
  忌: term('忌·阻碍', 'Ji · Obstacles', 'Ji · Obstáculos', '忌・障害'),
};
export const BRIGHTNESS_TERMS: Record<string, Term> = {
  庙: term('庙', 'Exalted', 'Exaltado', '廟'), 旺: term('旺', 'Prosperous', 'Próspero', '旺'),
  得: term('得', 'Supported', 'Favorecido', '得'), 利: term('利', 'Favorable', 'Favorable', '利'),
  平: term('平', 'Neutral', 'Neutro', '平'), 不: term('不', 'Weak', 'Débil', '不'),
  闲: term('闲', 'Idle', 'Inactivo', '閑'), 陷: term('陷', 'Fallen', 'En caída', '陥'), 地: term('地', 'Ground', 'Tierra', '地'),
};
export const ELEMENT_TERMS: Record<number, Term> = {
  2: term('水二局', 'Water · 2', 'Agua · 2', '水二局'),
  3: term('木三局', 'Wood · 3', 'Madera · 3', '木三局'),
  4: term('金四局', 'Metal · 4', 'Metal · 4', '金四局'),
  5: term('土五局', 'Earth · 5', 'Tierra · 5', '土五局'),
  6: term('火六局', 'Fire · 6', 'Fuego · 6', '火六局'),
};
export const BRANCH_ROMAN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
export const STEM_ROMAN = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const STAR_ROMAN: Record<string, string> = {
  紫微: 'Zi Wei', 天机: 'Tian Ji', 太阳: 'Tai Yang', 武曲: 'Wu Qu', 天同: 'Tian Tong', 廉贞: 'Lian Zhen', 天府: 'Tian Fu', 太阴: 'Tai Yin', 贪狼: 'Tan Lang', 巨门: 'Ju Men', 天相: 'Tian Xiang', 天梁: 'Tian Liang', 七杀: 'Qi Sha', 破军: 'Po Jun',
  左辅: 'Zuo Fu', 右弼: 'You Bi', 文昌: 'Wen Chang', 文曲: 'Wen Qu', 禄存: 'Lu Cun', 天马: 'Tian Ma', 擎羊: 'Qing Yang', 陀罗: 'Tuo Luo', 火星: 'Huo Xing', 铃星: 'Ling Xing', 天魁: 'Tian Kui', 天钺: 'Tian Yue', 地空: 'Di Kong', 地劫: 'Di Jie',
  天空: 'Tian Kong', 天刑: 'Tian Xing', 天姚: 'Tian Yao', 解神: 'Jie Shen', 阴煞: 'Yin Sha', 天喜: 'Tian Xi', 天官: 'Tian Guan', 天福: 'Tian Fu', 天哭: 'Tian Ku', 天虚: 'Tian Xu', 龙池: 'Long Chi', 凤阁: 'Feng Ge', 红鸾: 'Hong Luan', 孤辰: 'Gu Chen', 寡宿: 'Gua Su', 蜚廉: 'Fei Lian', 破碎: 'Po Sui', 台辅: 'Tai Fu', 封诰: 'Feng Gao', 天巫: 'Tian Wu', 天月: 'Tian Yue', 三台: 'San Tai', 八座: 'Ba Zuo', 恩光: 'En Guang', 天贵: 'Tian Gui', 天才: 'Tian Cai', 天寿: 'Tian Shou', 截空: 'Jie Kong', 副截: 'Fu Jie', 旬空: 'Xun Kong', 副旬: 'Fu Xun', 月德: 'Yue De', 天伤: 'Tian Shang', 天使: 'Tian Shi', 天厨: 'Tian Chu', 龙德: 'Long De', 劫煞: 'Jie Sha', 大耗: 'Da Hao', 截路: 'Jie Lu', 空亡: 'Kong Wang',
};
export function starName(name: string, locale: Locale): string {
  if (locale === 'zh') return name;
  if (locale === 'ja') return name.replaceAll('机', '機').replaceAll('阳', '陽').replaceAll('阴', '陰').replaceAll('贞', '貞').replaceAll('贪', '貪').replaceAll('门', '門').replaceAll('杀', '殺').replaceAll('军', '軍').replaceAll('辅', '輔').replaceAll('禄', '禄').replaceAll('马', '馬').replaceAll('罗', '羅').replaceAll('铃', '鈴').replaceAll('钺', '鉞').replaceAll('龙', '竜').replaceAll('凤', '鳳').replaceAll('红', '紅').replaceAll('鸾', '鸞').replaceAll('诰', '誥').replaceAll('贵', '貴').replaceAll('寿', '寿').replaceAll('伤', '傷');
  return STAR_ROMAN[name] ? `${STAR_ROMAN[name]} (${name})` : name;
}

export const STAR_THEMES: Record<string, Term> = {
  紫微: term('领导、统筹、独立', 'Leadership, coordination, independence', 'Liderazgo, coordinación, independencia', '統率、調整、自立'),
  天机: term('思考、谋划、变化', 'Thought, planning, change', 'Reflexión, planificación, cambio', '思考、計画、変化'),
  太阳: term('表达、公众形象、付出', 'Expression, public presence, contribution', 'Expresión, presencia pública, contribución', '表現、社会的な立場、貢献'),
  武曲: term('执行、资源管理、决断', 'Execution, resource management, resolve', 'Acción, gestión de recursos, determinación', '実行、資源管理、決断'),
  天同: term('和谐、舒适、人际关系', 'Harmony, comfort, relationships', 'Armonía, bienestar, relaciones', '調和、安らぎ、人間関係'),
  廉贞: term('原则、才艺、情感', 'Principles, creativity, emotion', 'Principios, creatividad, emoción', '原則、創造性、感情'),
  天府: term('稳定、储备、管理', 'Stability, reserves, stewardship', 'Estabilidad, reservas, administración', '安定、蓄積、管理'),
  太阴: term('细腻、内省、积累', 'Sensitivity, reflection, accumulation', 'Sensibilidad, introspección, acumulación', '繊細さ、内省、蓄積'),
  贪狼: term('探索、社交、欲望', 'Exploration, sociability, desire', 'Exploración, sociabilidad, deseo', '探究、社交、欲求'),
  巨门: term('沟通、分析、辩论', 'Communication, analysis, debate', 'Comunicación, análisis, debate', '意思疎通、分析、議論'),
  天相: term('协调、辅佐、公平', 'Coordination, support, fairness', 'Coordinación, apoyo, equidad', '調整、補佐、公平'),
  天梁: term('关怀、原则、阅历', 'Care, principles, experience', 'Cuidado, principios, experiencia', '配慮、原則、経験'),
  七杀: term('开创、行动、挑战', 'Initiative, action, challenge', 'Iniciativa, acción, retos', '開拓、行動、挑戦'),
  破军: term('更新、突破、变动', 'Renewal, breakthrough, change', 'Renovación, innovación, cambio', '刷新、突破、変動'),
};
