'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import styles from './error.module.css';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    OAuthSignin: 'Ошибка при подключении к Google. Попробуйте еще раз.',
    OAuthCallback: 'Ошибка при завершении входа. Попробуйте еще раз.',
    OAuthCreateAccount: 'Не удалось создать аккаунт. Попробуйте позже.',
    EmailCreateAccount: 'Не удалось создать аккаунт с этим адресом.',
    EmailSignInError: 'Не удалось войти с этим адресом.',
    SessionCallback: 'Ошибка сеанса. Пожалуйста, войдите еще раз.',
    Callback: 'Ошибка при обратном вызове. Пожалуйста, попробуйте еще раз.',
    Default: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
  };

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>⚠️</div>
        <h1 className={styles.title}>Ошибка входа</h1>
        <p className={styles.message}>{message}</p>
        <button
          onClick={() => router.push('/auth/signin')}
          className={styles.button}
        >
          Попробовать еще раз
        </button>
        <button
          onClick={() => router.push('/')}
          className={styles.secondaryButton}
        >
          На главную
        </button>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
