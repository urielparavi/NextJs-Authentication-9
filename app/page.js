import AuthForm from '@/components/auth-form';

// `searchParams` is a reserved key in Next.js that contains the URL query parameters
export default async function Home({ searchParams }) {
  // mode = 'login', 'signup'
  // searchParams = {  mode: 'signup' }; for example
  const formMode = searchParams.mode || 'login';
  return <AuthForm mode={formMode} />;
}
