// Run with: node --test lib/store/merge.test.ts   (Node 24 strips the types)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSeed } from './merge.ts';
import type { Product } from '../catalog/types.ts';

const P = (id: string, updatedAt: string, price = 100): Product =>
  ({ id, sku: id.toUpperCase(), slug: id, brand: 'X', name: { fr: id, en: id }, category: 'ranges',
    price, condition: 'used', inventoryStatus: 'in-stock', images: [], featured: false, deal: false,
    status: 'published', createdAt: '2026-09-01T00:00:00.000Z', updatedAt }) as Product;

const T0 = '2026-09-10T00:00:00.000Z';
const T1 = '2026-09-20T00:00:00.000Z';
const T2 = '2026-09-25T00:00:00.000Z';
const T3 = '2026-09-30T00:00:00.000Z';

test('a document without a watermark uses its newest updatedAt as the baseline', () => {
  const doc = { products: [P('a', T0), P('b', T1, 200)] }; // b saved in admin at T1 = the save that created the doc
  const seed = [P('a', T0), P('b', T0), P('c', T2)];        // c added to the seed later
  const out = mergeSeed(doc, seed);
  assert.deepEqual(out.products.map((p) => [p.id, p.price]), [['a', 100], ['b', 200], ['c', 100]]);
  assert.equal(out.seedSyncedAt, T2);
  assert.equal(out.changed, true);
});

test('seed edit after the watermark replaces an untouched product', () => {
  const doc = { products: [P('a', T0)], seedSyncedAt: T1 };
  const out = mergeSeed(doc, [P('a', T2, 350)]);
  assert.equal(out.products[0].price, 350);
  assert.equal(out.seedSyncedAt, T2);
});

test('the later of two edits wins', () => {
  const adminLater = mergeSeed({ products: [P('a', T3, 999)], seedSyncedAt: T1 }, [P('a', T2, 350)]);
  assert.equal(adminLater.products[0].price, 999);
  const seedLater = mergeSeed({ products: [P('a', T2, 999)], seedSyncedAt: T1 }, [P('a', T3, 350)]);
  assert.equal(seedLater.products[0].price, 350);
});

test('a product deleted in the admin stays deleted while the seed leaves it alone', () => {
  const out = mergeSeed({ products: [P('a', T0)], seedSyncedAt: T2 }, [P('a', T0), P('gone', T1)]);
  assert.deepEqual(out.products.map((p) => p.id), ['a']);
});

test('a product deleted in the admin comes back once the seed edits it', () => {
  const out = mergeSeed({ products: [P('a', T0)], seedSyncedAt: T2 }, [P('a', T0), P('gone', T3)]);
  assert.deepEqual(out.products.map((p) => p.id).sort(), ['a', 'gone']);
});

test('products created only in the admin are untouched', () => {
  const out = mergeSeed({ products: [P('gh-owner', T2, 42)], seedSyncedAt: T2 }, [P('a', T3)]);
  assert.deepEqual(out.products.map((p) => [p.id, p.price]), [['gh-owner', 42], ['a', 100]]);
});

test('nothing to fold in → unchanged, watermark unchanged', () => {
  const out = mergeSeed({ products: [P('a', T0)], seedSyncedAt: T2 }, [P('a', T0)]);
  assert.equal(out.changed, false);
  assert.equal(out.seedSyncedAt, T2);
});

test('microsecond timestamps from the Python scripts compare correctly', () => {
  const out = mergeSeed({ products: [P('a', '2026-09-30T19:00:00.000Z')], seedSyncedAt: '2026-09-30T18:00:00Z' },
    [P('a', '2026-09-30T19:00:00.463353Z', 350)]);
  assert.equal(out.products[0].price, 350);
});
