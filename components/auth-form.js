'use client';

import { auth } from '@/actions/auth-actions';
import Link from 'next/link';
import { useActionState } from 'react';

export default function AuthForm({ mode }) {
  // mode = 'login', 'signup'

  // Binds the current `mode` ('login' or 'signup') to the `auth` function,
  // so that `useActionState` only needs to provide `prevState` and `formData` when triggered.
  // This ensures `mode` stays constant for this form instance.
  const [formState, formAction] = useActionState(auth.bind(null, mode), {});
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => (
            <li key={error}>{formState.errors[error]}</li>
          ))}
        </ul>
      )}
      <p>
        <button type="submit">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </p>
      <p>
        {mode === 'login' && (
          // If we're in 'login' mode, we want to switch to 'signup' mode
          // So we show a link to the signup version of the page
          <Link href="/?mode=signup">Create an account.</Link>
        )}
        {mode === 'signup' && (
          // If we're in 'signup' mode, we want to switch to 'login' mode
          // So we show a link to the login version of the page
          <Link href="/?mode=login">Login with existing account.</Link>
        )}
      </p>
    </form>
  );
}
