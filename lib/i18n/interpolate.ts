/**
 * Substitutes `{token}` placeholders in a dictionary string.
 *
 * Dictionary entries are plain strings rather than functions because the copy
 * deck is passed from Server Components into Client Components, and functions
 * are not serialisable across that boundary.
 *
 *   t(dict.product.inquirePrefill, { product: 'Samsung 36" fridge' })
 */
export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
