import { PrismaClient, SchoolRole, SystemRole } from "@prisma/client";
// توجه: برای هش کردن پسورد مطابق Better Auth، بهتره از پکیج خود پروتکل استفاده بشه
// اما برای Seed اولیه، فیلد password رو فعلاً خالی می‌ذاریم یا
// از یک یوزر که قبلاً ساخته شده استفاده می‌کنیم.
// راه حل ساده: ساخت کاربر با Prisma و گذاشتن یک هش معتبر.

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Seed...");

  // 1. پاکسازی داده‌های قبلی (اختیاری - با احتیاط)
  // await prisma.userAssignment.deleteMany();
  // await prisma.school.deleteMany();
  // await prisma.academicYear.deleteMany();

  // 2. ایجاد مدرسه
  const school = await prisma.school.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "دبستان نمونه دولتی ایران",
      isActive: true,
    },
  });
  console.log("✅ School created");

  // 3. ایجاد سال تحصیلی
  const year = await prisma.academicYear.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "1403-1404",
      isActive: true,
    },
  });
  console.log("✅ Academic Year created");

  // 4. ایجاد کاربر مدیر (Manager)
  // نکته: فیلد password در Better Auth معمولاً در جدول Account ذخیره می‌شود.
  // برای Seed ساده، فقط User را می‌سازیم.
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "مدیر سیستم",
      firstName: "علی",
      lastName: "محمدی",
      systemRole: SystemRole.MASTER,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Admin User created");

  // 5. ایجاد کاربر معلم (Teacher)
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@test.com" },
    update: {},
    create: {
      email: "teacher@test.com",
      name: "معلم تستی",
      firstName: "سارا",
      lastName: "رضایی",
      systemRole: SystemRole.USER,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log("✅ Teacher User created");

  // 6. ایجاد انتساب‌ها (Assignments)
  // مدیر در این مدرسه و سال
  await prisma.userAssignment.upsert({
    where: {
      userId_schoolId_academicYearId_role: {
        userId: adminUser.id,
        schoolId: school.id,
        academicYearId: year.id,
        role: SchoolRole.MANAGER,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      schoolId: school.id,
      academicYearId: year.id,
      role: SchoolRole.MANAGER,
    },
  });

  // همان شخص معلم هم باشد (برای تست انتخاب کانتکست)
  await prisma.userAssignment.upsert({
    where: {
      userId_schoolId_academicYearId_role: {
        userId: adminUser.id,
        schoolId: school.id,
        academicYearId: year.id,
        role: SchoolRole.TEACHER,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      schoolId: school.id,
      academicYearId: year.id,
      role: SchoolRole.TEACHER,
    },
  });

  console.log("✅ Assignments created");
  console.log("✨ Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
