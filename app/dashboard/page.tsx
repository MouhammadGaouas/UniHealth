import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export default async function DashboardPage() {
  const allCookies = await cookies();
  const token = allCookies.get('token')?.value;

  if (!token) redirect('/login');

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
  } catch {
    redirect('/login');
  }

  // مثال حماية صفحة الأدمن
  if (user.role === 'PATIENT') redirect('/unauthorized');

  return (
    <div>
      <h1>Welcome, {user.role}</h1>
    </div>
  );
}
