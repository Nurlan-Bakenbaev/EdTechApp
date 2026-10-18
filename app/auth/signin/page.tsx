'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './signin.module.css';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('google', {
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ошибка входа. Попробуйте еще раз.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Добро пожаловать в BILIM</h1>
        <p className={styles.subtitle}>Вход в ваш аккаунт</p>

        {error && <div className={styles.error}>{error}</div>}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={styles.googleButton}
        >
          {isLoading ? 'Загрузка...' : 'Войти с Google'}
        </button>

        <p className={styles.footer}>
          Впервые здесь? Зарегистрируйтесь с помощью Google.
        </p>
      </div>
    </div>
  );
}
