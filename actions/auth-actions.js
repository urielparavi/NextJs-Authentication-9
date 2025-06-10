'use server';

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

  // store it in database (create a new user)
}
