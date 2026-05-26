const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@landportal.et' },
    update: { password, status: 'Active' },
    create: {
      fullName: 'Demo User',
      email: 'demo@landportal.et',
      phone: '+251911234567',
      faydaId: '1234567890123456',
      password,
      role: 'Citizen',
      status: 'Active',
    },
  });

  console.log('Seeded demo user:', demo.email);
  console.log('  Password: password123');

  // Seed Officer demo user (for officer/admin portal testing)
  const officer = await prisma.user.upsert({
    where: { email: 'officer@landportal.et' },
    update: { password, status: 'Active', role: 'Officer' },
    create: {
      fullName: 'Land Officer',
      email: 'officer@landportal.et',
      phone: '+251922222222',
      faydaId: '2234567890123456',
      password,
      role: 'Officer',
      status: 'Active',
    },
  });

  console.log('Seeded officer user:', officer.email);
  console.log('  Password: password123');

  // Seed Admin demo user (for officer/admin portal testing)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@landportal.et' },
    update: { password, status: 'Active', role: 'Admin' },
    create: {
      fullName: 'System Admin',
      email: 'admin@landportal.et',
      phone: '+251933333333',
      faydaId: '3234567890123456',
      password,
      role: 'Admin',
      status: 'Active',
    },
  });

  console.log('Seeded admin user:', admin.email);
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
