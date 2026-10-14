import {stateQuestionLoaders, universalQuestionLoaders} from '../content';
import {currentLang} from '../i18n';
import {clearTranslationCache, localizeStateQuestions, localizeUniversal} from '../i18n/content';
import type {Question, StateCode, TopicId, TrackId} from './types';

/** All questions that apply to one learner: universal ones for the track + their state's. */
export interface Bank {
  track: TrackId;
  state: StateCode;
  questions: Question[];
  byId: Map<string, Question>;
  byTopic: Map<TopicId, Question[]>;
  /** Questions that only apply to this state. */
  stateSpecific: Question[];
  /** Questions with a road-sign image. */
  signQuestions: Question[];
}

// Caches are keyed by language: questions are shown in the learner's language where translated.
const universalCache = new Map<string, Question[]>();
const stateCache = new Map<string, Question[]>();
const bankCache = new Map<string, Bank>();

function universal(track: TrackId): Question[] {
  const lang = currentLang();
  const key = `${lang}:${track}`;
  let qs = universalCache.get(key);
  if (!qs) {
    qs = localizeUniversal(
      universalQuestionLoaders[track].flatMap(load => load()),
      lang,
      track,
    );
    universalCache.set(key, qs);
  }
  return qs;
}

function stateOnly(state: StateCode): Question[] {
  const lang = currentLang();
  const key = `${lang}:${state}`;
  let qs = stateCache.get(key);
  if (!qs) {
    const load = stateQuestionLoaders[state];
    qs = load ? localizeStateQuestions(load(), lang, state) : [];
    stateCache.set(key, qs);
  }
  return qs;
}

export function getBank(track: TrackId, state: StateCode): Bank {
  const key = `${currentLang()}:${track}:${state}`;
  const hit = bankCache.get(key);
  if (hit) {
    return hit;
  }
  const stateSpecific = stateOnly(state).filter(q => q.track === track);
  const questions = [
    ...universal(track).filter(q => !q.states || q.states.includes(state)),
    ...stateSpecific,
  ];
  const byId = new Map<string, Question>();
  const byTopic = new Map<TopicId, Question[]>();
  for (const q of questions) {
    byId.set(q.id, q);
    const list = byTopic.get(q.topic);
    if (list) {
      list.push(q);
    } else {
      byTopic.set(q.topic, [q]);
    }
  }
  const bank: Bank = {
    track,
    state,
    questions,
    byId,
    byTopic,
    stateSpecific,
    signQuestions: questions.filter(q => !!q.sign),
  };
  bankCache.set(key, bank);
  return bank;
}

/** Questions in the bank for the given ids (unknown ids — e.g. from another state — are skipped). */
export function resolveIds(bank: Bank, ids: Iterable<string>): Question[] {
  const out: Question[] = [];
  for (const id of ids) {
    const q = bank.byId.get(id);
    if (q) {
      out.push(q);
    }
  }
  return out;
}

const ACCENTS: Record<string, string> = {á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n'};
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[áéíóúüñ]/g, c => ACCENTS[c])
    .replace(/[^a-z0-9 ]+/g, ' ');

/** Simple multi-word search over prompt, choices and explanation. */
export function searchBank(bank: Bank, query: string, limit = 60): Question[] {
  const terms = normalize(query).split(/\s+/).filter(t => t.length > 1);
  if (!terms.length) {
    return [];
  }
  const scored: {q: Question; score: number}[] = [];
  for (const q of bank.questions) {
    const prompt = normalize(q.prompt);
    const rest = normalize(q.choices.join(' ') + ' ' + q.explanation);
    let score = 0;
    let all = true;
    for (const t of terms) {
      const inPrompt = prompt.includes(t);
      const inRest = rest.includes(t);
      if (!inPrompt && !inRest) {
        all = false;
        break;
      }
      score += inPrompt ? 3 : 1;
    }
    if (all) {
      scored.push({q, score});
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.q);
}

/** For tests: drop cached banks after content changes. */
export function clearBankCache() {
  universalCache.clear();
  stateCache.clear();
  bankCache.clear();
  clearTranslationCache();
}
