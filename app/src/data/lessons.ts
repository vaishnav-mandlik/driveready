import {lessonLoaders} from '../content';
import {currentLang} from '../i18n';
import {localizeLesson} from '../i18n/content';
import {getTrack} from './tracks';
import type {Lesson, TopicId, TrackId} from './types';

const cache = new Map<string, Lesson[]>();

function all(): Lesson[] {
  const lang = currentLang();
  let lessons = cache.get(lang);
  if (!lessons) {
    lessons = lessonLoaders.map(load => localizeLesson(load(), lang));
    cache.set(lang, lessons);
  }
  return lessons;
}

/** Lessons for a track in topic order; the road-test guide comes last. */
export function getLessons(track: TrackId): Lesson[] {
  const order = new Map<string, number>(getTrack(track).topics.map((t, i) => [t.id, i]));
  return all()
    .filter(l => l.track === track)
    .sort((a, b) => (order.get(a.topic) ?? 99) - (order.get(b.topic) ?? 99) || a.title.localeCompare(b.title));
}

export function getLesson(id: string): Lesson | undefined {
  return all().find(l => l.id === id);
}

export function getLessonsForTopic(topic: TopicId): Lesson[] {
  return all().filter(l => l.topic === topic);
}
