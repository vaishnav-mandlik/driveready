import type {Bank} from '../data/bank';
import type {ExamConfig, Question, TopicId} from '../data/types';
import {isMastered, knowledge, QStat} from './srs';

export interface TopicReadiness {
  topic: TopicId;
  total: number;
  seen: number;
  mastered: number;
  /** Share of attempts answered correctly, or null if never practiced. */
  accuracy: number | null;
  /** Estimated chance of answering a random question in this topic right now. */
  knowledge: number;
}

export type ReadinessLabel = 'Just starting' | 'Keep practicing' | 'Getting there' | 'Almost ready' | 'Ready to pass';

export interface Readiness {
  passProbability: number;
  predictedAccuracy: number;
  expectedScore: number;
  coverage: number;
  total: number;
  seen: number;
  mastered: number;
  label: ReadinessLabel;
  topics: TopicReadiness[];
  weakest: TopicReadiness | null;
  exam: ExamConfig;
}

/** P(X >= k) for X ~ Binomial(n, p). */
export function binomialAtLeast(n: number, k: number, p: number): number {
  if (k <= 0) {
    return 1;
  }
  if (k > n) {
    return 0;
  }
  const q = 1 - p;
  if (p <= 0) {
    return 0;
  }
  if (q <= 0) {
    return 1;
  }
  // log pmf for numerical stability
  let logC = 0; // log C(n, 0)
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    if (i > 0) {
      logC += Math.log(n - i + 1) - Math.log(i);
    }
    if (i >= k) {
      sum += Math.exp(logC + i * Math.log(p) + (n - i) * Math.log(q));
    }
  }
  return Math.min(1, Math.max(0, sum));
}

export function labelFor(passProbability: number, coverage: number): ReadinessLabel {
  if (coverage < 0.05 && passProbability < 0.4) {
    return 'Just starting';
  }
  if (passProbability < 0.4) {
    return 'Keep practicing';
  }
  if (passProbability < 0.7) {
    return 'Getting there';
  }
  if (passProbability < 0.9) {
    return 'Almost ready';
  }
  return 'Ready to pass';
}

/**
 * Estimates the learner's chance of passing the real test: per-question
 * knowledge (from spaced-repetition history) averaged over the exam's pool,
 * with unseen questions estimated from the learner's accuracy in that topic,
 * then a binomial model over the state's question count and passing score.
 */
export function computeReadiness(bank: Bank, stats: Record<string, QStat>, exam: ExamConfig): Readiness {
  const pool: Question[] = exam.topic ? bank.byTopic.get(exam.topic) ?? [] : bank.questions;
  const topics = new Map<TopicId, Question[]>();
  for (const q of pool) {
    const list = topics.get(q.topic);
    if (list) {
      list.push(q);
    } else {
      topics.set(q.topic, [q]);
    }
  }

  const topicRows: TopicReadiness[] = [];
  let kSum = 0;
  let seen = 0;
  let mastered = 0;
  for (const [topic, qs] of topics) {
    let a = 0;
    let c = 0;
    let tSeen = 0;
    let tMastered = 0;
    for (const q of qs) {
      const s = stats[q.id];
      if (s && s.a > 0) {
        a += s.a;
        c += s.c;
        tSeen++;
        if (isMastered(s)) {
          tMastered++;
        }
      }
    }
    const smoothed = (c + 1) / (a + 2);
    const unseenPrior = 0.35 + 0.5 * smoothed;
    let tk = 0;
    for (const q of qs) {
      tk += knowledge(stats[q.id], unseenPrior);
    }
    kSum += tk;
    seen += tSeen;
    mastered += tMastered;
    topicRows.push({
      topic,
      total: qs.length,
      seen: tSeen,
      mastered: tMastered,
      accuracy: a ? c / a : null,
      knowledge: qs.length ? tk / qs.length : 0,
    });
  }

  const total = pool.length;
  const p = total ? kSum / total : 0;
  const n = Math.min(exam.questions, Math.max(1, total));
  const need = Math.ceil((exam.passingScore * n) / Math.max(1, exam.questions));
  const passProbability = total ? binomialAtLeast(n, need, p) : 0;
  const coverage = total ? seen / total : 0;
  const practiced = topicRows.filter(t => t.seen > 0);
  const weakest = (practiced.length ? practiced : topicRows).reduce<TopicReadiness | null>(
    (w, t) => (!w || t.knowledge < w.knowledge ? t : w),
    null,
  );

  return {
    passProbability,
    predictedAccuracy: p,
    expectedScore: p * n,
    coverage,
    total,
    seen,
    mastered,
    label: labelFor(passProbability, coverage),
    topics: topicRows,
    weakest,
    exam,
  };
}
