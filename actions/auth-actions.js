'use server';

import { hashUserPassword } from '@/lib/hash';
import { createUser } from '@/lib/user';

export async function signup(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  let errors = {};

  if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (password.trim().length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  // const keys = Object.keys(errors);
  // console.log(keys); // ['email', 'password']

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  const hashedPassword = hashUserPassword(password);
  // "5f2d7c4e8a1b3d2f4e6a9b7c1d0e5f3a:a1b2c3d4e5f6a7b8"
  createUser(email, hashedPassword);
}
