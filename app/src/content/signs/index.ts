/* Placeholder sign registry — replaced by scripts/build-signs.mjs output. */
import type {SignInfo} from '../../data/types';

export const SIGNS: SignInfo[] = [
  {
    code: 'R1-1',
    name: 'Stop',
    category: 'regulatory',
    shape: 'Octagon',
    colors: 'Red with white legend',
    meaning: 'Come to a complete stop at the stop line, crosswalk or intersection edge, then yield before proceeding.',
    aspect: 1,
    xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3" fill="#fff"/><polygon points="30.5,3 69.5,3 97,30.5 97,69.5 69.5,97 30.5,97 3,69.5 3,30.5" fill="#C1272D"/><text x="50" y="61" font-size="30" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Arial">STOP</text></svg>',
  },
  {
    code: 'R1-2',
    name: 'Yield',
    category: 'regulatory',
    shape: 'Downward-pointing triangle',
    colors: 'Red border, white center, red legend',
    meaning: 'Slow down and be ready to stop; let traffic and pedestrians with the right-of-way go first.',
    aspect: 1.155,
    xml: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 115.5 100"><polygon points="0,0 115.5,0 57.75,100" fill="#C1272D"/><polygon points="20,11.5 95.5,11.5 57.75,77" fill="#fff"/><text x="57.75" y="38" font-size="15" font-weight="bold" fill="#C1272D" text-anchor="middle" font-family="Arial">YIELD</text></svg>',
  },
];
