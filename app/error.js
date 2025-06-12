'use client';
// This is a Client Component because we need to handle errors interactively on the client side.
// Specifically, this allows us to:
// - Use React hooks like useEffect (e.g., to report the error to Sentry)
// - Add UI interactions (e.g., a "Try Again" button that calls reset())
// Without 'use client', this component would be a Server Component and could not access client-side features.

export default function Error() {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. Please try again later.</p>
    </div>
  );
}
