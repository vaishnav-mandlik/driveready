import type {SourceRef} from '../../data/types';
import {defineStrings, tr} from '../../i18n';

const STR = defineStrings(
  {
    handbookPage: (page: number | string) => `Handbook p. ${page}`,
    documentPage: (page: number | string) => `Official document p. ${page}`,
    website: 'Official website',
  },
  {
    handbookPage: (page: number | string) => `Manual, pág. ${page}`,
    documentPage: (page: number | string) => `Documento oficial, pág. ${page}`,
    website: 'Sitio web oficial',
  },
);

/**
 * Where a fact comes from, as shown to learners. Only the state's own driver handbook is called
 * "Handbook p. N"; facts verified against statutes or other official PDFs (motorcycle manuals, law
 * compilations) must not claim a handbook page they don't come from.
 */
export function sourceLabel(source: SourceRef, handbookUrl: string): string {
  const t = tr(STR);
  if (source.page && source.url && source.url === handbookUrl) {
    return t.handbookPage(source.page);
  }
  if (source.page && /\.pdf($|[?#])/i.test(source.url ?? '')) {
    return t.documentPage(source.page);
  }
  return t.website;
}
