// Seed script for UniHealth - uses raw SQL via prisma.$executeRaw
import PrismaRuntime from '@prisma/client/runtime/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const PrismaClient = PrismaRuntime.PrismaClient || PrismaRuntime.default;

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for all test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const now = new Date();

  // Helper to generate cuid-like IDs
  const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // ──────────────────────────────────────────────
  // 1. Create System Admin
  // ──────────────────────────────────────────────
  const adminId = generateId('user');
  await prisma.user.create({
    data: {
      id: adminId,
      email: 'admin@unihealth.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      phoneNumber: '+1234567890',
    },
  });
  console.log('✅ Created Admin: admin@unihealth.com');

  // ──────────────────────────────────────────────
  // 2. Create Hospital Organization
  // ──────────────────────────────────────────────
  const hospitalAdminId = generateId('user');
  const hospitalId = generateId('org');
  const hospitalSubId = generateId('sub');
  const hospitalLocationId = generateId('loc');

  await prisma.user.create({
    data: {
      id: hospitalAdminId,
      email: 'hospital.admin@unihealth.com',
      name: 'Hospital Administrator',
      password: hashedPassword,
      role: 'ORG_ADMIN',
      emailVerified: true,
      phoneNumber: '+1234567891',
      organizationId: hospitalId,
    },
  });

  await prisma.organization.create({
    data: {
      id: hospitalId,
      name: 'City General Hospital',
      type: 'HOSPITAL',
      users: { connect: { id: hospitalAdminId } },
      subscription: {
        create: {
          id: hospitalSubId,
          planTier: 'ENTERPRISE',
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          maxDoctors: 100,
          maxAppointmentsPerMonth: 10000,
          features: ['Full analytics', '24/7 support', 'Unlimited locations'],
        },
      },
    },
  });

  await prisma.location.create({
    data: {
      id: hospitalLocationId,
      name: 'Main Campus',
      address: '100 Medical Center Drive',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      phone: '+1234567800',
      organizationId: hospitalId,
    },
  });

  console.log('✅ Created Hospital: City General Hospital');

  // ──────────────────────────────────────────────
  // 3. Create Clinic Organization
  // ──────────────────────────────────────────────
  const clinicAdminId = generateId('user');
  const clinicId = generateId('org');
  const clinicSubId = generateId('sub');
  const clinicLocationId = generateId('loc');

  await prisma.user.create({
    data: {
      id: clinicAdminId,
      email: 'clinic.admin@unihealth.com',
      name: 'Clinic Administrator',
      password: hashedPassword,
      role: 'ORG_ADMIN',
      emailVerified: true,
      phoneNumber: '+1234567892',
      organizationId: clinicId,
    },
  });

  await prisma.organization.create({
    data: {
      id: clinicId,
      name: 'Downtown Medical Clinic',
      type: 'CLINIC',
      users: { connect: { id: clinicAdminId } },
      subscription: {
        create: {
          id: clinicSubId,
          planTier: 'PROFESSIONAL',
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          maxDoctors: 20,
          maxAppointmentsPerMonth: 1000,
          features: ['Advanced analytics', 'Priority support', '5 locations'],
        },
      },
    },
  });

  await prisma.location.create({
    data: {
      id: clinicLocationId,
      name: 'Downtown Branch',
      address: '500 Health Street',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      phone: '+1234567801',
      organizationId: clinicId,
    },
  });

  console.log('✅ Created Clinic: Downtown Medical Clinic');

  // ──────────────────────────────────────────────
  // 4. Create Doctors
  // ──────────────────────────────────────────────
  const doctorsData = [
    { email: 'doctor1@unihealth.com', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', orgId: hospitalId, locId: hospitalLocationId },
    { email: 'doctor2@unihealth.com', name: 'Dr. Michael Chen', specialty: 'Pediatrics', orgId: hospitalId, locId: hospitalLocationId },
    { email: 'doctor3@unihealth.com', name: 'Dr. Emily Williams', specialty: 'Dermatology', orgId: hospitalId, locId: hospitalLocationId },
    { email: 'doctor4@unihealth.com', name: 'Dr. James Brown', specialty: 'Orthopedics', orgId: hospitalId, locId: hospitalLocationId },
    { email: 'doctor5@unihealth.com', name: 'Dr. Lisa Garcia', specialty: 'Neurology', orgId: hospitalId, locId: hospitalLocationId },
    { email: 'doctor6@unihealth.com', name: 'Dr. Robert Martinez', specialty: 'General Practice', orgId: clinicId, locId: clinicLocationId },
    { email: 'doctor7@unihealth.com', name: 'Dr. Jennifer Lee', specialty: 'Family Medicine', orgId: clinicId, locId: clinicLocationId },
    { email: 'doctor8@unihealth.com', name: 'Dr. David Wilson', specialty: 'Internal Medicine', orgId: clinicId, locId: clinicLocationId },
  ];

  const doctors = [];

  for (const docData of doctorsData) {
    const doctorUserId = generateId('user');
    const doctorId = generateId('doc');

    const doctorUser = await prisma.user.create({
      data: {
        id: doctorUserId,
        email: docData.email,
        name: docData.name,
        password: hashedPassword,
        role: 'DOCTOR',
        emailVerified: true,
        phoneNumber: '+1234567893',
        organizationId: docData.orgId,
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        id: doctorId,
        userId: doctorUserId,
        specialty: docData.specialty,
        bio: `Experienced ${docData.specialty} specialist with 10+ years of practice.`,
        available: true,
        startTime: '09:00',
        endTime: '17:00',
        organizationId: docData.orgId,
        locationId: docData.locId,
      },
    });

    // Create appointment types
    const aptTypes = [
      { name: 'Quick Consultation', duration: 15, price: 50 },
      { name: 'Follow-up', duration: 30, price: 75 },
      { name: 'First Visit', duration: 45, price: 100 },
      { name: 'Comprehensive Exam', duration: 60, price: 150 },
    ];

    for (const aptType of aptTypes) {
      await prisma.appointmentType.create({
        data: {
          id: generateId('at'),
          name: aptType.name,
          duration: aptType.duration,
          price: aptType.price,
          doctorId: doctor.id,
        },
      });
    }

    doctors.push({ ...doctor, user: doctorUser, aptTypes });
    console.log(`✅ Created Doctor: ${docData.name} (${docData.specialty})`);
  }

  // ──────────────────────────────────────────────
  // 5. Create Patients
  // ──────────────────────────────────────────────
  const patientsData = [
    { email: 'patient1@unihealth.com', name: 'John Doe', phone: '+1234567810' },
    { email: 'patient2@unihealth.com', name: 'Jane Smith', phone: '+1234567811' },
    { email: 'patient3@unihealth.com', name: 'Bob Johnson', phone: '+1234567812' },
    { email: 'patient4@unihealth.com', name: 'Alice Williams', phone: '+1234567813' },
    { email: 'patient5@unihealth.com', name: 'Charlie Brown', phone: '+1234567814' },
    { email: 'patient6@unihealth.com', name: 'Diana Prince', phone: '+1234567815' },
    { email: 'patient7@unihealth.com', name: 'Edward Norton', phone: '+1234567816' },
    { email: 'patient8@unihealth.com', name: 'Fiona Apple', phone: '+1234567817' },
    { email: 'patient9@unihealth.com', name: 'George Lucas', phone: '+1234567818' },
    { email: 'patient10@unihealth.com', name: 'Helen Mirren', phone: '+1234567819' },
  ];

  const patients = [];

  for (const patData of patientsData) {
    const patient = await prisma.user.create({
      data: {
        id: generateId('user'),
        email: patData.email,
        name: patData.name,
        password: hashedPassword,
        role: 'PATIENT',
        emailVerified: true,
        phoneNumber: patData.phone,
        gender: ['John', 'Bob', 'Charlie', 'Edward', 'George'].includes(patData.name.split(' ')[0]) ? 'MALE' : 'FEMALE',
        birthday: new Date('1990-01-15'),
      },
    });

    patients.push(patient);
    console.log(`✅ Created Patient: ${patData.name}`);
  }

  // ──────────────────────────────────────────────
  // 6. Create Appointments
  // ──────────────────────────────────────────────
  const appointmentsData = [
    { patient: patients[0], doctor: doctors[0], daysOffset: 1, hour: 9, status: 'CONFIRMED' },
    { patient: patients[1], doctor: doctors[0], daysOffset: 1, hour: 10, status: 'PENDING' },
    { patient: patients[2], doctor: doctors[1], daysOffset: 2, hour: 11, status: 'CONFIRMED' },
    { patient: patients[3], doctor: doctors[2], daysOffset: 2, hour: 14, status: 'PENDING' },
    { patient: patients[4], doctor: doctors[3], daysOffset: 3, hour: 9, status: 'CONFIRMED' },
    { patient: patients[5], doctor: doctors[4], daysOffset: 3, hour: 15, status: 'PENDING' },
    { patient: patients[6], doctor: doctors[5], daysOffset: 4, hour: 10, status: 'CONFIRMED' },
    { patient: patients[7], doctor: doctors[6], daysOffset: 5, hour: 11, status: 'PENDING' },
    { patient: patients[8], doctor: doctors[7], daysOffset: 5, hour: 14, status: 'CONFIRMED' },
    { patient: patients[9], doctor: doctors[0], daysOffset: 6, hour: 9, status: 'PENDING' },
    { patient: patients[0], doctor: doctors[1], daysOffset: -5, hour: 10, status: 'COMPLETED' },
    { patient: patients[1], doctor: doctors[2], daysOffset: -3, hour: 11, status: 'COMPLETED' },
    { patient: patients[2], doctor: doctors[5], daysOffset: -2, hour: 14, status: 'COMPLETED' },
    { patient: patients[3], doctor: doctors[6], daysOffset: -1, hour: 9, status: 'COMPLETED' },
    { patient: patients[4], doctor: doctors[3], daysOffset: -1, hour: 15, status: 'CANCELLED' },
    { patient: patients[5], doctor: doctors[7], daysOffset: 0, hour: 10, status: 'CANCELLED' },
  ];

  for (const aptData of appointmentsData) {
    const dateTime = new Date(now);
    dateTime.setDate(dateTime.getDate() + aptData.daysOffset);
    dateTime.setHours(aptData.hour, 0, 0, 0);
    const endTime = new Date(dateTime.getTime() + 30 * 60000);

    await prisma.appointment.create({
      data: {
        id: generateId('apt'),
        patientId: aptData.patient.id,
        doctorId: aptData.doctor.id,
        dateTime,
        endTime,
        status: aptData.status,
        reason: aptData.status === 'COMPLETED' ? 'Regular checkup' : 'Scheduled appointment',
        notes: aptData.status === 'CANCELLED' ? 'Patient requested cancellation' : null,
        appointmentTypeId: aptData.doctor.aptTypes?.[0] ? generateId('at') : undefined,
      },
    });

    console.log(`✅ Created Appointment: ${aptData.patient.name} with ${aptData.doctor.user.name} (${aptData.status})`);
  }

  // ──────────────────────────────────────────────
  // 7. Create Consultation Notes
  // ──────────────────────────────────────────────
  const completedAppointments = await prisma.appointment.findMany({
    where: { status: 'COMPLETED' },
    include: { patient: true, doctor: true },
  });

  for (const apt of completedAppointments) {
    await prisma.consultationNote.create({
      data: {
        id: generateId('note'),
        appointmentId: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        title: 'Consultation Summary',
        content: `Patient ${apt.patient.name} presented for consultation. Examination completed successfully.`,
        category: 'DIAGNOSIS',
        isConfidential: false,
      },
    });
    console.log(`✅ Created Note for: ${apt.patient.name}`);
  }

  // ──────────────────────────────────────────────
  // 8. Create Notification Preferences
  // ──────────────────────────────────────────────
  const allUsers = [...patients, ...doctors.map(d => d.user)];
  for (const user of allUsers) {
    await prisma.notificationPreference.createMany({
      data: [
        { id: generateId('np'), userId: user.id, channel: 'EMAIL', enabled: true },
        { id: generateId('np'), userId: user.id, channel: 'SMS', enabled: user.role === 'DOCTOR', },
        { id: generateId('np'), userId: user.id, channel: 'PUSH', enabled: true },
      ],
    });
  }

  console.log('✅ Created notification preferences');

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log('\n📊 Seed Summary:');
  console.log('─────────────────────────────────────');
  
  const userCount = await prisma.user.count();
  const doctorCount = await prisma.doctor.count();
  const orgCount = await prisma.organization.count();
  const locationCount = await prisma.location.count();
  const appointmentCount = await prisma.appointment.count();
  const noteCount = await prisma.consultationNote.count();

  console.log(`👥 Users: ${userCount}`);
  console.log(`🩺 Doctors: ${doctorCount}`);
  console.log(`🏥 Organizations: ${orgCount}`);
  console.log(`📍 Locations: ${locationCount}`);
  console.log(`📅 Appointments: ${appointmentCount}`);
  console.log(`📝 Consultation Notes: ${noteCount}`);
  console.log('─────────────────────────────────────');
  
  console.log('\n🔐 Test Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Password for ALL accounts: password123');
  console.log('');
  console.log('Admin:        admin@unihealth.com');
  console.log('Hospital:     hospital.admin@unihealth.com');
  console.log('Clinic:       clinic.admin@unihealth.com');
  console.log('Doctors:      doctor1@unihealth.com through doctor8@unihealth.com');
  console.log('Patients:     patient1@unihealth.com through patient10@unihealth.com');
  console.log('─────────────────────────────────────');
  console.log('\n✅ Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
