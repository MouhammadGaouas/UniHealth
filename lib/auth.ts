import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
      email?: string;
      name?: string;
    };
  } catch {
    return null;
  }
}




export function requireRole(
  user: { role: string } | null,
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
) {

  if (!user || user.role !== role) {
    throw new Error('Forbidden');
  }

}
