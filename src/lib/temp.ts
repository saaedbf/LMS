//کاربر
model User {
  id            String    @id @default(cuid())
  name          String    // نام 
  family        String    // نام خانوادگی
  username      String    @unique // کد ملی یا کد پرسنلی
  password      String?   // رمز عبور هش شده
  phone         String?   @unique // شماره موبایل
  image         String?
  role          Role      @default(STUDENT)
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // روابط
  schoolEnrollments SchoolEnrollment[]
  teacherAssignments TeacherAssignment[]
  managedSchools    School[] @relation("SchoolManager")
  sessions          Session[]
  accounts          Account[]
  @@map("users")
}
//نقش
enum Role {
  SUPER_ADMIN   // مدیر کل سیستم
  SCHOOL_ADMIN  // مدیر مدرسه
  TEACHER       // معلم
  STUDENT       // دانش‌آموز
 
}
// prisma/schema.prisma

// ============================================
// مدل سال تحصیلی (محور اصلی سیستم)
// ============================================
model AcademicYear {
  id          String   @id @default(cuid())
  title       String   // "1403-1404"
  startDate   DateTime // شروع سال تحصیلی
  endDate     DateTime // پایان سال تحصیلی
  isActive    Boolean  @default(false) // سال جاری
  isClosed    Boolean  @default(false) // بسته شده برای ویرایش
  
  // روابط
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  
  // کلاس‌های این سال
  classes     Class[]
  // ثبت‌نام‌های این سال
  enrollments SchoolEnrollment[]
  // تخصیص معلمان در این سال
  teacherAssignments TeacherAssignment[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([schoolId, title])
  @@map("academic_years")
}

// ============================================
// به‌روزرسانی مدل‌های دیگر
// ============================================

model School {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  address     String?
  phone       String?
  email       String?
  managerId   String?
  manager     User?    @relation("SchoolManager", fields: [managerId], references: [id])
  
  // ✅ سال‌های تحصیلی مدرسه
  academicYears AcademicYear[]
  // کلاس‌ها
  classes     Class[]
  // ثبت‌نام‌ها
  enrollments SchoolEnrollment[]
  // تخصیص معلمان
  teacherAssignments TeacherAssignment[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("schools")
}

model Class {
  id          String   @id @default(cuid())
  title       String
  code        String   @unique
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  
  // ✅ سال تحصیلی
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  
  teacherId   String?
  teacher     TeacherAssignment? @relation("TeacherClasses", fields: [teacherId], references: [id])
  grade       String   // پایه تحصیلی
  
  // دانش‌آموزان این کلاس در این سال
  students    SchoolEnrollment[]
  lessons     Lesson[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([schoolId, academicYearId, code])
  @@map("classes")
}

model SchoolEnrollment {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  
  // ✅ سال تحصیلی
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  
  classId     String?
  class       Class?   @relation(fields: [classId], references: [id])
  
  enrollDate  DateTime @default(now())
  leaveDate   DateTime?
  isActive    Boolean  @default(true)
  
  studentCode String   @unique
  firstName   String
  lastName    String
  nationalCode String  @unique
  birthDate   DateTime?
  phone       String?
  address     String?
 
  
  grades      Grade[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, schoolId, academicYearId])
  @@map("school_enrollments")
}

model TeacherAssignment {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  
  // ✅ سال تحصیلی
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  
  assignDate  DateTime @default(now())
  endDate     DateTime?
  isActive    Boolean  @default(true)
  
  employeeCode String  @unique
  firstName   String
  lastName    String
  nationalCode String @unique
  phone       String?
  address     String?
  hireDate    DateTime @default(now())
  
  classes     Class[]  @relation("TeacherClasses")
  lessons     Lesson[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, schoolId, academicYearId])
  @@map("teacher_assignments")
}

model Lesson {
  id          String   @id @default(cuid())
  title       String
  code        String   @unique
  classId     String
  class       Class    @relation(fields: [classId], references: [id])
  
  // ✅ سال تحصیلی از طریق کلاس مشخص میشه
  teacherId   String?
  teacher     TeacherAssignment? @relation(fields: [teacherId], references: [id])
  unit        Int      @default(1)
  
  grades      Grade[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("lessons")
}

model Grade {
  id          String   @id @default(cuid())
  enrollmentId String
  enrollment  SchoolEnrollment @relation(fields: [enrollmentId], references: [id])
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id])
  
  // ✅ سال تحصیلی از طریق enrollment مشخص میشه
  score       Float
  term        String   // "first", "second"
  examType    String   // "midterm", "final", "quiz"
  date        DateTime @default(now())
  teacherId   String?
  teacher     TeacherAssignment? @relation(fields: [teacherId], references: [id])
  description String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([enrollmentId, lessonId, term])
  @@map("grades")
}

// ============================================
// مدل‌های Better Auth
// ============================================
model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?

  @@map("sessions")
}

model Account {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId        String
  providerId       String
  accessToken      String?
  refreshToken     String?
  accessTokenExpiresAt DateTime?
  refreshTokenExpiresAt DateTime?
  scope            String?
  idToken          String?
  password         String?  // برای Credential Provider

  @@unique([providerId, accountId])
  @@map("accounts")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verifications")
}

