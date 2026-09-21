import { redirect } from 'next/navigation';
import Image from 'next/image';
import { hasValidSession } from '@/lib/admin/auth';
import { LoginForm } from '@/components/admin/LoginForm';

export default async function LoginPage() {
  if (await hasValidSession()) redirect('/admin');
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Image src="/brand/logo.png" alt="Électroménagers GH" width={132} height={72} className="h-16 w-auto" priority />
        <h1 className="mt-8 font-display text-2xl font-semibold tracking-[-0.02em]">Gestion de l’inventaire</h1>
        <p className="mt-2 text-sm text-ink-2">Entrez le mot de passe pour continuer.</p>
        <LoginForm />
      </div>
    </main>
  );
}
