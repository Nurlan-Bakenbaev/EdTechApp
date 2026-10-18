'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useLocalAuth } from '@/lib/auth-context';
import { signIn } from 'next-auth/react';
import styles from './signin.module.css';

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useLocalAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Пожалуйста, заполните все поля');
      }
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const result = await signIn('google', {
        redirect: false,
      });

      if (result?.error) {
        setError('Google OAuth требует Supabase. Используйте email/password.');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ошибка при входе через Google');
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Добро пожаловать в BILIM</h1>
        <p className={styles.subtitle}>Вход в ваш аккаунт</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={styles.input}
              disabled={isLoading || authLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={styles.input}
              disabled={isLoading || authLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>

        <div className={styles.divider}>или</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || authLoading}
          className={styles.googleButton}
        >
          {isLoading ? 'Загрузка...' : 'Войти с Google'}
        </button>

        <p className={styles.footer}>
          Нет аккаунта?{' '}
          <Link href="/auth/register" className={styles.link}>
            Зарегистрируйтесь здесь
          </Link>
        </p>
      </div>
    </div>
  );
}

