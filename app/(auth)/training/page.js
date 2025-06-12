import { verifyAuth } from '@/lib/auth';
import { getTrainings } from '@/lib/training';
import { redirect } from 'next/navigation';

export default async function TrainingPage() {
  const result = await verifyAuth();
  // result:
  // {
  //   user: { ... } | null,
  //   session: { id, userId, expiresAt, fresh, ... } | null
  // }

  // If no valid user is found (i.e., the session is invalid or expired),
  // redirect the user to the homepage to prevent unauthorized access
  if (!result.user) {
    return redirect('/');
  }

  const trainingSessions = getTrainings();

  return (
    <main>
      <h1>Find your favorite activity</h1>
      <ul id="training-sessions">
        {trainingSessions.map((training) => (
          <li key={training.id}>
            <img src={`/trainings/${training.image}`} alt={training.title} />
            <div>
              <h2>{training.title}</h2>
              <p>{training.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
