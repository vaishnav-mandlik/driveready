import type {Question, SignCategory, SignInfo} from '../../data/types';
import {allSigns, getSign, signsByCategory} from '../../data/signs';
import type {SignCategoryMeta} from '../../data/signs';

/** "all" or one sign category (Signs grid filter, Flashcards deck). */
export type CategoryFilter = SignCategory | 'all';

export interface SignGroup {
  meta: SignCategoryMeta;
  signs: SignInfo[];
}

export interface SignLibrary {
  /** Non-empty categories in display order. */
  groups: SignGroup[];
  /** Every sign once, in display order (category order, then registry order). */
  ordered: SignInfo[];
  /** code -> index in `ordered`. */
  position: Map<string, number>;
  byCategory: Map<SignCategory, SignGroup>;
}

let cache: {source: SignInfo[]; library: SignLibrary} | null = null;

/**
 * The sign registry grouped and ordered for browsing. Computed once per
 * registry (it is static at runtime) so 200+ signs cost nothing per render.
 */
export function getSignLibrary(): SignLibrary {
  const source = allSigns();
  if (cache && cache.source === source) {
    return cache.library;
  }
  const seen = new Set<string>();
  const groups: SignGroup[] = [];
  for (const g of signsByCategory()) {
    // Defensive: a duplicated code in generated content must not break list keys.
    const signs = g.signs.filter(s => {
      if (!s.code || seen.has(s.code)) {
        return false;
      }
      seen.add(s.code);
      return true;
    });
    if (signs.length) {
      groups.push({meta: g.meta, signs});
    }
  }
  const ordered = groups.flatMap(g => g.signs);
  const library: SignLibrary = {
    groups,
    ordered,
    position: new Map(ordered.map((s, i) => [s.code, i])),
    byCategory: new Map(groups.map(g => [g.meta.id, g])),
  };
  cache = {source, library};
  return library;
}

/** Signs in one category, or all of them. Unknown categories yield an empty list. */
export function signsIn(library: SignLibrary, category: CategoryFilter): SignInfo[] {
  return category === 'all' ? library.ordered : library.byCategory.get(category)?.signs ?? [];
}

/* ------------------------------------------------------------------ search */

// English + Spanish filler words (Spanish sign names/categories are searchable too).
const FILLER = new Set(['sign', 'signs', 'the', 'a', 'an', 'of', 'road', 'traffic', 'senal', 'senales', 'de', 'del', 'la', 'el', 'los', 'las', 'transito']);

const ACCENTS: Record<string, string> = {á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n'};
/** Lowercase with Spanish accents folded, so "señal" and "senal" match. */
const fold = (s: string) => s.toLowerCase().replace(/[áéíóúüñ]/g, c => ACCENTS[c]);

const normalize = (s: string) =>
  fold(s)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const compact = (s: string) => fold(s).replace(/[^a-z0-9]+/g, '');

function terms(query: string): string[] {
  const all = normalize(query).split(' ').filter(Boolean);
  const meaningful = all.filter(t => !FILLER.has(t));
  return meaningful.length ? meaningful : all;
}

/**
 * Ranked multi-word search over name, code, category, shape, colors and
 * meaning. Every word must match somewhere; name and code hits rank first.
 */
export function findSigns(library: SignLibrary, query: string, category: CategoryFilter = 'all'): SignInfo[] {
  const words = terms(query);
  if (!words.length) {
    return signsIn(library, category);
  }
  const phrase = words.join(' ');
  const exactCode = compact(query);
  const scored: {sign: SignInfo; score: number; pos: number}[] = [];
  for (const g of library.groups) {
    if (category !== 'all' && g.meta.id !== category) {
      continue;
    }
    const categoryText = normalize(`${g.meta.title} ${g.meta.id}`);
    for (const sign of g.signs) {
      const name = normalize(sign.name);
      const code = normalize(sign.code);
      const nameWords = name.split(' ');
      const labels = sign.shapeLabel || sign.colorsLabel ? ` ${normalize(sign.shapeLabel ?? '')} ${normalize(sign.colorsLabel ?? '')}` : '';
      const facts = `${name} ${code} ${categoryText} ${normalize(sign.shape)} ${normalize(sign.colors)}${labels}`;
      const everything = `${facts} ${normalize(sign.meaning)}`;
      let score: number;
      if (compact(sign.code) === exactCode) {
        score = 0;
      } else if (name === phrase) {
        score = 1;
      } else if (name.startsWith(phrase)) {
        score = 2;
      } else if (words.every(w => nameWords.some(n => n.startsWith(w)))) {
        score = 3;
      } else if (words.every(w => name.includes(w))) {
        score = 4;
      } else if (words.every(w => facts.includes(w))) {
        score = 5;
      } else if (words.every(w => everything.includes(w))) {
        score = 6;
      } else {
        continue;
      }
      scored.push({sign, score, pos: library.position.get(sign.code) ?? 0});
    }
  }
  scored.sort((a, b) => a.score - b.score || a.pos - b.pos);
  return scored.map(s => s.sign);
}

/* -------------------------------------------------------------------- grid */

export type GridItem =
  | {type: 'section'; key: string; meta: SignCategoryMeta; count: number; index: number}
  | {type: 'intro'; key: string; meta: SignCategoryMeta; count: number; index: number}
  | {type: 'results'; key: string; count: number}
  | {type: 'row'; key: string; signs: SignInfo[]};

/** Columns for the sign grid: at least 3 (phones), more on wide screens. */
export function gridColumns(width: number, gutter: number, gap: number, minTile = 104): number {
  const usable = Math.max(0, width - gutter * 2);
  const n = Math.floor((usable + gap) / (minTile + gap));
  return Math.max(3, Math.min(6, n));
}

function rows(signs: SignInfo[], columns: number, prefix: string): GridItem[] {
  const out: GridItem[] = [];
  for (let i = 0; i < signs.length; i += columns) {
    const chunk = signs.slice(i, i + columns);
    out.push({type: 'row', key: `${prefix}:${columns}:${chunk[0].code}`, signs: chunk});
  }
  return out;
}

/**
 * Flat list items for the Signs grid: category headers + rows of tiles.
 * One FlatList (virtualized) handles 200+ signs smoothly.
 */
export function buildGridItems(library: SignLibrary, category: CategoryFilter, query: string, columns: number): GridItem[] {
  if (query.trim()) {
    const results = findSigns(library, query, category);
    return results.length ? [{type: 'results', key: 'results', count: results.length}, ...rows(results, columns, 'q')] : [];
  }
  if (category === 'all') {
    return library.groups.flatMap((g, index) => [
      {type: 'section' as const, key: `s:${g.meta.id}`, meta: g.meta, count: g.signs.length, index},
      ...rows(g.signs, columns, g.meta.id),
    ]);
  }
  const index = library.groups.findIndex(g => g.meta.id === category);
  const group = library.groups[index];
  if (!group) {
    return [];
  }
  return [
    {type: 'intro', key: `i:${category}`, meta: group.meta, count: group.signs.length, index},
    ...rows(group.signs, columns, category),
  ];
}

/* ----------------------------------------------------------------- related */

/** Same-category signs, same shape first, then nearest neighbours in the registry order. */
export function similarSigns(library: SignLibrary, sign: SignInfo, limit = 10): SignInfo[] {
  const group = library.byCategory.get(sign.category);
  if (!group) {
    return [];
  }
  const at = group.signs.findIndex(s => s.code === sign.code);
  const shape = normalize(sign.shape);
  return group.signs
    .map((s, i) => ({s, i}))
    .filter(x => x.s.code !== sign.code)
    .sort((a, b) => {
      const sa = normalize(a.s.shape) === shape ? 0 : 1;
      const sb = normalize(b.s.shape) === shape ? 0 : 1;
      return sa - sb || Math.abs(a.i - at) - Math.abs(b.i - at) || a.i - b.i;
    })
    .slice(0, limit)
    .map(x => x.s);
}

/** Sign-question ids grouped by the category of the sign they show. */
export function signQuestionIdsByCategory(questions: Question[]): Map<SignCategory, string[]> {
  const out = new Map<SignCategory, string[]>();
  for (const q of questions) {
    const sign = getSign(q.sign);
    if (!sign) {
      continue;
    }
    const list = out.get(sign.category);
    if (list) {
      list.push(q.id);
    } else {
      out.set(sign.category, [q.id]);
    }
  }
  return out;
}

/** "Octagon" from "octagon"; leaves already-capitalized text alone. */
export function capitalize(s: string): string {
  const t = s.trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}
