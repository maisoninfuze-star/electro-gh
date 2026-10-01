// Run with: node --test lib/store/merge.test.ts   (Node 24 strips the types)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSeed } from './merge.ts';
import type { Product } from '../catalog/types.ts';

const P = (id: string, over: Partial<Product> = {}): Product =>
  ({ id, sku: id.toUpperCase(), slug: id, brand: 'X', name: { fr: id, en: id }, category: 'ranges',
    price: 100, condition: 'used', inventoryStatus: 'in-stock',
    images: [{ src: `/inventory/${id}.webp`, alt: id, width: 1600, height: 1600, kind: 'studio' }],
    featured: false, deal: false, status: 'published',
    createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z', ...over }) as Product;

const baseOf = (ps: Product[]) => Object.fromEntries(ps.map((p) => [p.id, p]));
const NOW = '2026-10-01T12:00:00.000Z';
const ids = (ps: Product[]) => ps.map((p) => p.id).sort();
const get = (ps: Product[], id: string) => ps.find((p) => p.id === id)!;

test('nothing changed in the seed → unchanged, even if the owner edited', () => {
  const seed = [P('a'), P('b')];
  const doc = { products: [P('a', { price: 999, updatedAt: NOW }), P('b')], seedBase: baseOf(seed) };
  const out = mergeSeed(doc, seed, NOW);
  assert.equal(out.changed, false);
  assert.equal(get(out.products, 'a').price, 999);
});

test('a new seed product is added', () => {
  const old = [P('a')];
  const out = mergeSeed({ products: [P('a')], seedBase: baseOf(old) }, [P('a'), P('c')], NOW);
  assert.deepEqual(ids(out.products), ['a', 'c']);
  assert.equal(out.changed, true);
});

test('the seed changes one field: only that field moves, the owner keeps the rest', () => {
  const old = [P('a')];
  // Owner marked it sold and changed the price; the developer then swaps the photo.
  const mine = P('a', { status: 'sold', price: 275, updatedAt: '2026-09-30T20:00:00.000Z' });
  const newImg = [{ src: '/inventory/a-v2.webp', alt: 'a', width: 1600, height: 1600, kind: 'studio' as const }];
  const out = mergeSeed({ products: [mine], seedBase: baseOf(old) }, [P('a', { images: newImg, updatedAt: NOW })], NOW);
  const a = get(out.products, 'a');
  assert.equal(a.status, 'sold');
  assert.equal(a.price, 275);
  assert.equal(a.images[0].src, '/inventory/a-v2.webp');
  assert.equal(a.updatedAt, NOW);
});

test('a seed edit never republishes a unit the owner took down', () => {
  const old = [P('a')];
  const out = mergeSeed({ products: [P('a', { status: 'draft' })], seedBase: baseOf(old) },
    [P('a', { notes: 'vérifié', updatedAt: NOW })], NOW);
  assert.equal(get(out.products, 'a').status, 'draft');
  assert.equal(get(out.products, 'a').notes, 'vérifié');
});

test('both sides changed the same field: the seed value wins', () => {
  const old = [P('a')];
  const out = mergeSeed({ products: [P('a', { price: 275 })], seedBase: baseOf(old) }, [P('a', { price: 350 })], NOW);
  assert.equal(get(out.products, 'a').price, 350);
});

test('a product the owner deleted stays deleted, even if the seed edits it', () => {
  const old = [P('a'), P('gone')];
  const out = mergeSeed({ products: [P('a')], seedBase: baseOf(old) }, [P('a'), P('gone', { price: 5, updatedAt: NOW })], NOW);
  assert.deepEqual(ids(out.products), ['a']);
});

test('removed from the seed and untouched in the admin → removed', () => {
  const old = [P('a'), P('dupe')];
  const out = mergeSeed({ products: [P('a'), P('dupe')], seedBase: baseOf(old) }, [P('a')], NOW);
  assert.deepEqual(ids(out.products), ['a']);
  assert.equal(out.changed, true);
  assert.equal('dupe' in out.seedBase!, false);
});

test('removed from the seed but edited by the owner → kept', () => {
  const old = [P('a'), P('dupe')];
  const out = mergeSeed({ products: [P('a'), P('dupe', { price: 1, updatedAt: NOW })], seedBase: baseOf(old) }, [P('a')], NOW);
  assert.deepEqual(ids(out.products), ['a', 'dupe']);
});

test('products created only in the admin are untouched', () => {
  const seed = [P('a')];
  const out = mergeSeed({ products: [P('a'), P('gh-owner', { price: 42 })], seedBase: baseOf(seed) }, seed, NOW);
  assert.equal(get(out.products, 'gh-owner').price, 42);
  assert.equal(out.changed, false);
});

test('a field removed in the seed is removed in the document', () => {
  const old = [P('a', { priceOnRequest: true, price: 0 })];
  const out = mergeSeed({ products: [P('a', { priceOnRequest: true, price: 0 })], seedBase: baseOf(old) }, [P('a', { price: 350 })], NOW);
  const a = get(out.products, 'a');
  assert.equal(a.price, 350);
  assert.equal('priceOnRequest' in a, false);
});

test('key order and bookkeeping stamps alone are not a change', () => {
  const a = P('a');
  const reordered = Object.fromEntries(Object.entries(a).reverse()) as unknown as Product;
  const out = mergeSeed({ products: [a], seedBase: baseOf([a]) }, [{ ...reordered, updatedAt: NOW }], NOW);
  // The base is refreshed (stamp differs) but the product itself is not rewritten.
  assert.equal(get(out.products, 'a').updatedAt, a.updatedAt);
});

test('first save: an empty document takes the whole seed and records it as the base', () => {
  const seed = [P('a'), P('b')];
  const out = mergeSeed({ products: [] }, seed, NOW);
  assert.deepEqual(ids(out.products), ['a', 'b']);
  assert.deepEqual(Object.keys(out.seedBase!).sort(), ['a', 'b']);
});

test('legacy document: products at or before the watermark are their own base', () => {
  const T = '2026-09-30T19:36:28.954Z';
  const seed = [P('a', { updatedAt: '2026-09-20T00:00:00.000Z' }), P('b', { updatedAt: T })];
  // Owner unpublished a and edited b after the first save. Seed unchanged since.
  const doc = { products: [P('a', { status: 'draft', updatedAt: '2026-09-30T21:00:00.000Z' }), P('b', { price: 1, updatedAt: '2026-09-30T21:05:00.000Z' })], seedSyncedAt: T };
  const out = mergeSeed(doc, seed, NOW);
  assert.equal(get(out.products, 'a').status, 'draft');
  assert.equal(get(out.products, 'b').price, 1);
  assert.equal(out.changed, true); // only to persist the rebuilt base
  assert.deepEqual(Object.keys(out.seedBase!).sort(), ['a', 'b']);
});

test('legacy document: a seed product stamped after the watermark is new or newer-wins', () => {
  const T = '2026-09-30T19:36:28.954Z';
  const doc = { products: [P('a')], seedSyncedAt: T };
  const out = mergeSeed(doc, [P('a'), P('n', { updatedAt: '2026-10-01T00:00:00.000Z' })], NOW);
  assert.deepEqual(ids(out.products), ['a', 'n']);
});

test('legacy document without a watermark uses its newest updatedAt', () => {
  const doc = { products: [P('a'), P('b', { price: 200, updatedAt: '2026-09-20T00:00:00.000Z' })] };
  const seed = [P('a'), P('b'), P('c', { updatedAt: '2026-09-25T00:00:00.000Z' })];
  const out = mergeSeed(doc, seed, NOW);
  assert.deepEqual(out.products.map((p) => [p.id, p.price]).sort(), [['a', 100], ['b', 200], ['c', 100]]);
});

test('microsecond stamps from the Python scripts parse', () => {
  const doc = { products: [P('a')], seedSyncedAt: '2026-09-30T18:00:00Z' };
  const out = mergeSeed(doc, [P('a', { updatedAt: '2026-09-29T10:31:53.463353Z' })], NOW);
  assert.equal(Object.keys(out.seedBase!).length, 1);
});

test('idempotent: merging the result again changes nothing', () => {
  const old = [P('a'), P('dupe')];
  const first = mergeSeed({ products: [P('a', { price: 9 }), P('dupe')], seedBase: baseOf(old) }, [P('a', { notes: 'x' }), P('c')], NOW);
  const second = mergeSeed({ products: first.products, seedBase: first.seedBase, seedSyncedAt: first.seedSyncedAt }, [P('a', { notes: 'x' }), P('c')], '2026-10-02T00:00:00.000Z');
  assert.equal(second.changed, false);
  assert.deepEqual(second.products, first.products);
});
