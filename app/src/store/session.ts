import {create} from 'zustand';
import type {QuizSession} from '../engine/quiz';

/**
 * In-memory store of recent quiz sessions so Results/Review screens can look
 * them up by id (navigation params stay small and serializable).
 */
interface SessionStore {
  sessions: Record<string, QuizSession>;
  order: string[];
  save: (s: QuizSession) => void;
}

const KEEP = 10;

export const useSessions = create<SessionStore>()(set => ({
  sessions: {},
  order: [],
  save: s =>
    set(st => {
      const order = [s.id, ...st.order.filter(id => id !== s.id)];
      const sessions: Record<string, QuizSession> = {};
      for (const id of order.slice(0, KEEP)) {
        sessions[id] = id === s.id ? s : st.sessions[id];
      }
      return {sessions, order: order.slice(0, KEEP)};
    }),
}));

export const getSession = (id: string): QuizSession | undefined => useSessions.getState().sessions[id];
