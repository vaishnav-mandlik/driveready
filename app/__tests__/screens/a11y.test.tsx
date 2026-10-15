/**
 * Accessibility gate: on every screen, everything you can tap must be announced properly by
 * TalkBack — it needs a role (button, tab, link...) and a name (an accessibilityLabel or visible text).
 */
import React from 'react';
import {screen} from '@testing-library/react-native';
import {mockNav, renderWithProviders, setLearner} from '../utils/render';
import {useProgress} from '../../src/store/progress';
import {clearBankCache} from '../../src/data/bank';

jest.mock('../../src/content', () => require('../fixtures/content'));

import {CASES} from '../utils/screenCases';

type Node = {type: string; props: Record<string, unknown>; children?: (Node | string)[] | null};

function textOf(n: Node | string | null | undefined): string {
  if (n == null) {
    return '';
  }
  if (typeof n === 'string') {
    return n;
  }
  return (n.children ?? []).map(textOf).join(' ');
}

/** Tappable host elements that a screen reader cannot announce. */
function unnamedTappables(root: Node | Node[] | null): string[] {
  const problems: string[] = [];
  const walk = (n: Node | string | null | undefined) => {
    if (!n || typeof n === 'string') {
      return;
    }
    const p = n.props ?? {};
    const tappable = typeof p.onClick === 'function' || typeof p.onPress === 'function';
    if (tappable && p.accessibilityElementsHidden !== true && p.importantForAccessibility !== 'no-hide-descendants') {
      const label = String(p.accessibilityLabel ?? p['aria-label'] ?? '').trim();
      const role = String(p.accessibilityRole ?? p.role ?? '').trim();
      const text = textOf(n).replace(/\s+/g, ' ').trim();
      if (!role || (!label && !text)) {
        problems.push(`${n.type} role="${role}" label="${label}" text="${text.slice(0, 40)}" testID=${String(p.testID ?? '')}`);
      }
    }
    (n.children ?? []).forEach(walk);
  };
  (Array.isArray(root) ? root : [root]).forEach(walk);
  return problems;
}

beforeEach(() => {
  clearBankCache();
  useProgress.getState().resetProgress();
  setLearner();
});

describe('every tappable element has a role and a name', () => {
  test.each(CASES)('%s', async (_name, Screen, params) => {
    await renderWithProviders(<Screen {...mockNav(params)} />);
    expect(unnamedTappables(screen.toJSON() as Node | Node[] | null)).toEqual([]);
  });
});
