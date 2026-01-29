import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

const ALLOWED_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(req: NextRequest) {
  const user = getAuthUser(req);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Extract appointment id from URL path instead of relying on params
  const url = new URL(req.url);
  const match = url.pathname.match(/\/api\/appointments\/([^/]+)\/status/);
  const appointmentId = match?.[1];

  if (!appointmentId) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/001084d5-276b-467b-80bc-d645777b50f5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'doctor-confirm-run',
        hypothesisId: 'H5',
        location: 'app/api/appointments/[id]/status/route.ts:missing-id',
        message: 'Appointment id could not be parsed from URL',
        data: { pathname: url.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json(
      { message: 'Invalid appointment id in URL' },
      { status: 400 }
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/001084d5-276b-467b-80bc-d645777b50f5', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'doctor-confirm-run',
      hypothesisId: 'H1-H5',
      location: 'app/api/appointments/[id]/status/route.ts:PATCH-entry',
      message: 'PATCH status entry',
      data: { userId: user.id, role: user.role, appointmentId },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  try {
    try {
      requireRole(user, 'DOCTOR');
    } catch {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/001084d5-276b-467b-80bc-d645777b50f5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'doctor-confirm-run',
          hypothesisId: 'H2',
          location: 'app/api/appointments/[id]/status/route.ts:role-check',
          message: 'requireRole failed',
          data: { roleTried: 'DOCTOR' },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { status } = (await req.json()) as { status?: string };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/001084d5-276b-467b-80bc-d645777b50f5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'doctor-confirm-run',
        hypothesisId: 'H3',
        location: 'app/api/appointments/[id]/status/route.ts:payload',
        message: 'Received status payload',
        data: { status },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!status || !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      return NextResponse.json(
        { message: 'Invalid or missing status' },
        { status: 400 }
      );
    }

    // Ensure this appointment belongs to the logged-in doctor
    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/001084d5-276b-467b-80bc-d645777b50f5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'doctor-confirm-run',
        hypothesisId: 'H1',
        location: 'app/api/appointments/[id]/status/route.ts:doctor-lookup',
        message: 'Doctor lookup result',
        data: { doctorId: doctor?.id },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor profile not found for this user' },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
      },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/001084d5-276b-467b-80bc-d645777b50f5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'doctor-confirm-run',
        hypothesisId: 'H1',
        location: 'app/api/appointments/[id]/status/route.ts:appointment-lookup',
        message: 'Appointment lookup result',
        data: { found: !!appointment, appointmentDoctorId: appointment?.doctorId },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!appointment || appointment.doctorId !== doctor.id) {
      return NextResponse.json(
        { message: 'Appointment not found for this doctor' },
        { status: 404 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as AllowedStatus },
      include: {
        patient: {
          select: { name: true, email: true },
        },
      },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/001084d5-276b-467b-80bc-d645777b50f5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'doctor-confirm-run',
        hypothesisId: 'H4',
        location: 'app/api/appointments/[id]/status/route.ts:update-success',
        message: 'Status updated',
        data: { updatedId: updated.id, updatedStatus: updated.status },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json(
      { message: 'Status updated successfully', appointment: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating appointment status:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/001084d5-276b-467b-80bc-d645777b50f5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'doctor-confirm-run',
        hypothesisId: 'H5',
        location: 'app/api/appointments/[id]/status/route.ts:catch',
        message: 'Error updating appointment status',
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return NextResponse.json(
      { message: 'Error updating appointment status' },
      { status: 500 }
    );
  }
}

