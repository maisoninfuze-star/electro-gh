/**
 * Behavioural switches the owner controls without touching components.
 */
export const SITE_CONFIG = {
  /**
   * The primary call-to-action on a product page.
   *
   *   'call'    → "Appeler pour ce produit"  (default)
   *   'reserve' → "Réserver ce produit"      (opens the inquiry flow)
   *
   * Defaults to 'call' because it is the only action guaranteed to work with
   * the store's current process. Switch to 'reserve' once there is someone
   * monitoring an inbox — a reserve button nobody answers is worse than none.
   */
  primaryProductAction: 'call' as 'call' | 'reserve',

  /** Products shown in the "Vous pourriez aussi aimer" rail. */
  relatedCount: 4,
} as const;
