import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * ADMIN AUTH
 * ==========
 * One owner, one password, one signed cookie. No accounts, no database, no
 * third-party auth to expire or bill.
 *
 *   ADMIN_PASSWORD          required. Admin is DISABLED (503) without it —
 *                           there is no default password, ever.
 *   ADMIN_SESSION_SECRET    optional. Signs the cookie. Derived from the
 *                           password when unset, so rotating the password
 *                           also logs every device out.
 *
 * The cookie is `<expiry>.<hmac>`; the HMAC covers the expiry, so a token
 * cannot be extended by editing it. Web Crypto only, so the same code runs in
 * Node route handlers and in the edge proxy if it is ever needed there.
 */

const COOKIE = 'gh_admin';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — the owner's own phone

export const adminEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

async function secretKey(): Promise<CryptoKey> {
  const raw = process.env.ADMIN_SESSION_SECRET || `gh-session:${process.env.ADMIN_PASSWORD}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return crypto.subtle.importKey('raw', digest, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

const hex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function sign(payload: string): Promise<string> {
  const key = await secretKey();
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
}

/** Constant-time string compare — password and signature checks both use it. */
function safeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

export async function createSession(): Promise<void> {
  const exp = String(Date.now() + TTL_MS);
  const token = `${exp}.${await sign(exp)}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function hasValidSession(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sig, await sign(exp));
}

/** For layouts and pages: redirect to login when not signed in. */
export async function requireAdminPage(): Promise<void> {
  if (!(await hasValidSession())) redirect('/admin/login');
}

/** For server actions and route handlers: throw when not signed in. */
export async function requireAdmin(): Promise<void> {
  if (!(await hasValidSession())) throw new Error('UNAUTHORIZED');
}
