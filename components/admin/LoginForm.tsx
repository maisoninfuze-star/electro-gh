'use client';

import { useActionState } from 'react';
import { loginAction, type ActionState } from '@/app/admin/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, { ok: false });
  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-3">Mot de passe</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="min-h-12 rounded-[3px] border border-line-strong bg-surface px-3.5 text-base outline-none focus:border-accent"
        />
      </label>
      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-accent">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex min-h-12 items-center justify-center rounded-[3px] bg-accent px-6 text-[0.9375rem] font-medium text-accent-ink hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
