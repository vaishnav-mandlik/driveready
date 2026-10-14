import {translationLoaders} from '../content';
import type {
  ExamFormat,
  Lesson,
  LessonTranslation,
  Question,
  QuestionTranslation,
  SignInfo,
  SignTranslation,
  StateCode,
  StateInfo,
  TrackId,
} from '../data/types';
import {lessonHash, questionHash, signHash, textHash} from './hash';
import type {Lang} from './lang';

/*
 * Applies translations to English content. A translation is used only when its fingerprint
 * matches the current English, so corrections to the English are never hidden behind an
 * outdated translation (the English is shown until the translation is redone).
 */

const questionTables = new Map<string, Map<string, QuestionTranslation>>();

function questionTable(key: string, files: Array<(() => Record<string, QuestionTranslation>) | undefined>): Map<string, QuestionTranslation> {
  let table = questionTables.get(key);
  if (!table) {
    table = new Map();
    for (const load of files) {
      if (load) {
        for (const [id, t] of Object.entries(load())) {
          table.set(id, t);
        }
      }
    }
    questionTables.set(key, table);
  }
  return table;
}

function applyQuestion(q: Question, t: QuestionTranslation | undefined): Question {
  if (!t || t.c.length !== q.choices.length || t.h !== questionHash(q)) {
    return q;
  }
  return {...q, prompt: t.p, choices: t.c, explanation: t.e};
}

function apply(questions: Question[], table: Map<string, QuestionTranslation>): Question[] {
  return table.size ? questions.map(q => applyQuestion(q, table.get(q.id))) : questions;
}

/** A track's universal questions in `lang`. */
export function localizeUniversal(questions: Question[], lang: Lang, track: TrackId): Question[] {
  const loaders = lang === 'en' ? undefined : translationLoaders[lang];
  return loaders ? apply(questions, questionTable(`${lang}:u:${track}`, loaders.universal[track] ?? [])) : questions;
}

/** One state's own questions (all tracks) in `lang`. */
export function localizeStateQuestions(questions: Question[], lang: Lang, state: StateCode): Question[] {
  const loaders = lang === 'en' ? undefined : translationLoaders[lang];
  return loaders ? apply(questions, questionTable(`${lang}:s:${state}`, [loaders.states[state]])) : questions;
}

let lessonTables = new Map<Lang, Map<string, LessonTranslation>>();

export function localizeLesson(lesson: Lesson, lang: Lang): Lesson {
  if (lang === 'en') {
    return lesson;
  }
  let table = lessonTables.get(lang);
  if (!table) {
    table = new Map((translationLoaders[lang]?.lessons ?? []).map(load => load()).map(t => [t.id, t]));
    lessonTables.set(lang, table);
  }
  const t = table.get(lesson.id);
  if (!t || t.h !== lessonHash(lesson)) {
    return lesson;
  }
  return {...lesson, title: t.title, summary: t.summary, sections: t.sections, keyPoints: t.keyPoints};
}

let signTables = new Map<Lang, Map<string, SignTranslation>>();

export function localizeSign(sign: SignInfo, lang: Lang): SignInfo {
  if (lang === 'en') {
    return sign;
  }
  let table = signTables.get(lang);
  if (!table) {
    table = new Map();
    for (const load of translationLoaders[lang]?.signs ?? []) {
      for (const [code, t] of Object.entries(load())) {
        table.set(code, t);
      }
    }
    signTables.set(lang, table);
  }
  const t = table.get(sign.code);
  if (!t || t.h !== signHash(sign)) {
    return sign;
  }
  return {...sign, name: t.name, meaning: t.meaning, shapeLabel: t.shape, colorsLabel: t.colors};
}

function localizeExam<T extends Partial<ExamFormat> | null>(exam: T, tx: (s: string | null | undefined) => string | null | undefined): T {
  if (!exam) {
    return exam;
  }
  return {
    ...exam,
    roadSigns: tx(exam.roadSigns),
    format: tx(exam.format),
    languages: tx(exam.languages),
    retestWait: tx(exam.retestWait),
    notes: tx(exam.notes),
  };
}

/** State facts, laws and exam notes in `lang` (verbatim source quotes stay in English). */
export function localizeStateInfo(info: StateInfo, lang: Lang): StateInfo {
  const load = lang === 'en' ? undefined : translationLoaders[lang]?.stateInfo[info.code];
  if (!load) {
    return info;
  }
  const memory = load();
  const tx = <S extends string | null | undefined>(s: S): S => (s ? ((memory[textHash(s)] as S) ?? s) : s);
  return {
    ...info,
    exam: localizeExam(info.exam, tx) as ExamFormat,
    motorcycleExam: localizeExam(info.motorcycleExam, tx),
    cdlExam: localizeExam(info.cdlExam, tx),
    facts: info.facts.map(f => ({...f, value: tx(f.value), detail: tx(f.detail)})),
    notableLaws: info.notableLaws.map(l => ({...l, title: tx(l.title), summary: tx(l.summary)})),
  };
}

/** For tests and language switches: drop cached translation tables. */
export function clearTranslationCache() {
  questionTables.clear();
  lessonTables = new Map();
  signTables = new Map();
}
