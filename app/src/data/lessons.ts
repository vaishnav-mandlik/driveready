import {lessonLoaders} from '../content';
import {getTrack} from './tracks';
import type {Lesson, TopicId, TrackId} from './types';

let cache: Lesson[] | null = null;

function all(): Lesson[] {
  if (!cache) {
    cache = lessonLoaders.map(load => load());
  }
  return cache;
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
