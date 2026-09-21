/**
 * Pure text helpers, safe to import from client components. Keep this file
 * free of anything that touches the store or the filesystem — the search
 * overlay bundles it into the browser.
 */
/**
 * Accent- and case-insensitive. "refrigerateur" must match "Réfrigérateur",
 * because nobody types accents into a search box on a phone.
 */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
