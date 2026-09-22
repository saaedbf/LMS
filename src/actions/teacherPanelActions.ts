// actions/teacherPanelActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

// ==========================================
// ۱. دریافت لیست مدارس معلم
// ==========================================
export async function getTeacherSchools() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  try {
    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        teacher: { userId: currentUser.id },
        isActive: true,
      },
      include: {
        school: {
          select: {
            id: true,
            title: true,
            subTitle: true,
            sex: true,
            schoolType: true,
          },
        },
        academicYear: {
          select: { id: true, title: true, isActive: true },
        },
      },
      orderBy: [
        { academicYear: { isActive: "desc" } },
        { school: { title: "asc" } },
      ],
    });

    // گروه‌بندی بر اساس مدرسه (ممکن است معلم در چند سال در یک مدرسه باشد)
    const schoolMap = new Map<number, any>();

    for (const a of assignments) {
      if (!schoolMap.has(a.schoolId)) {
        schoolMap.set(a.schoolId, {
          schoolId: a.schoolId,
          schoolTitle: a.school.title,
          schoolSubTitle: a.school.subTitle,
          schoolSex: a.school.sex,
          schoolType: a.school.schoolType,
          academicYears: [],
        });
      }
      schoolMap.get(a.schoolId)!.academicYears.push({
        id: a.academicYear.id,
        title: a.academicYear.title,
        isActive: a.academicYear.isActive,
      });
    }

    return success(Array.from(schoolMap.values()));
  } catch (err) {
    console.error("getTeacherSchools error:", err);
    return error("خطا در دریافت مدارس");
  }
}

// ==========================================
// ۲. دریافت دوره‌های ثبت نمره فعال در مدرسه
// ==========================================
export async function getActiveGradePeriodsForTeacher(schoolId: number) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  try {
    // بررسی دسترسی معلم به این مدرسه
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        teacher: { userId: currentUser.id },
        schoolId,
        isActive: true,
      },
      include: {
        academicYear: { select: { id: true, isActive: true } },
      },
    });

    if (!assignment) return error("شما به این مدرسه دسترسی ندارید");

    // فقط دوره‌های فعال در سال تحصیلی جاری
    const periods = await prisma.gradePeriod.findMany({
      where: {
        schoolId,
        academicYearId: assignment.academicYearId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            klassPeriods: true,
            lessonPeriods: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return success({
      periods,
      academicYear: assignment.academicYear,
    });
  } catch (err) {
    console.error("getActiveGradePeriodsForTeacher error:", err);
    return error("خطا در دریافت دوره‌ها");
  }
}

// ==========================================
// ۳. دریافت کلاس‌های معلم در یک دوره ثبت نمره
// ==========================================
export async function getTeacherClassesInPeriod(
  schoolId: number,
  periodId: string,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  try {
    // بررسی دسترسی
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        teacher: { userId: currentUser.id },
        schoolId,
        isActive: true,
      },
    });

    if (!assignment) return error("شما به این مدرسه دسترسی ندارید");

    // دریافت teacherId
    const teacher = await prisma.teacher.findFirst({
      where: { userId: currentUser.id },
    });

    if (!teacher) return error("پروفایل معلم یافت نشد");

    // دریافت دوره
    const period = await prisma.gradePeriod.findFirst({
      where: {
        id: periodId,
        schoolId,
        academicYearId: assignment.academicYearId,
      },
    });

    if (!period) return error("دوره یافت نشد");

    // ۱. کلاس‌هایی که در دوره ثبت نمره هستند
    const periodKlasses = await prisma.gradePeriodKlass.findMany({
      where: { gradePeriodId: periodId },
      select: { klassId: true },
    });

    const periodKlassIds = periodKlasses.map((k) => k.klassId);

    if (periodKlassIds.length === 0) {
      return success({ classes: [], period });
    }

    // ۲. کلاس‌هایی که معلم در آن‌ها درس دارد + در دوره هستند
    const teacherClassCourses = await prisma.classCourse.findMany({
      where: {
        teacherId: teacher.id,
        klassId: { in: periodKlassIds },
      },
      include: {
        klass: {
          include: {
            paye: { select: { id: true, title: true } },
            reshtehTahsili: { select: { id: true, title: true } },
          },
        },
        darsPayeReshteh: {
          include: {
            reshtehTadris: { select: { id: true, title: true } },
          },
        },
      },
    });

    // گروه‌بندی بر اساس کلاس
    const classMap = new Map<string, any>();

    for (const cc of teacherClassCourses) {
      const klassId = cc.klassId;

      if (!classMap.has(klassId)) {
        classMap.set(klassId, {
          klassId,
          klassTitle: cc.klass.title,
          payeTitle: cc.klass.paye.title,
          reshtehTahsiliTitle: cc.klass.reshtehTahsili.title,
          lessons: [],
          totalStudents: 0,
          totalLessons: 0,
          gradedCount: 0,
          totalExpected: 0,
          progress: 0,
        });
      }

      classMap.get(klassId)!.lessons.push({
        classCourseId: cc.id,
        darsPayeReshtehId: cc.darsPayeReshtehId,
        lessonTitle: cc.darsPayeReshteh.reshtehTadris.title,
      });
    }

    // ۳. محاسبه آمار برای هر کلاس
    const classes = await Promise.all(
      Array.from(classMap.values()).map(async (cls) => {
        // تعداد دانش‌آموزان کلاس
        const studentsCount = await prisma.studentEnrollment.count({
          where: {
            klassId: cls.klassId,
            schoolId,
            academicYearId: assignment.academicYearId,
          },
        });

        // ⬅️ دروس این کلاس در این دوره
        const periodLessons = await prisma.gradePeriodLesson.findMany({
          where: {
            gradePeriodId: periodId,
            klassId: cls.klassId,
          },
          select: { id: true, darsPayeReshtehId: true },
        });

        // ⬅️ فقط دروسی که معلم در آن‌ها تدریس می‌کند
        const teacherLessonIds = cls.lessons.map(
          (l: any) => l.darsPayeReshtehId,
        );
        const relevantPeriodLessons = periodLessons.filter((pl) =>
          teacherLessonIds.includes(pl.darsPayeReshtehId),
        );

        // ⬅️ تعداد نمرات ثبت‌شده
        const gradedCount = await prisma.grade.count({
          where: {
            studentEnrollment: {
              klassId: cls.klassId,
              schoolId,
              academicYearId: assignment.academicYearId,
            },
            gradePeriodLessonId: {
              in: relevantPeriodLessons.map((l) => l.id),
            },
            // فقط نمرات غیرخالی
            OR: [{ score: { not: null } }, { descriptiveValue: { not: null } }],
          },
        });

        // ⬅️ تعداد کل نمرات مورد انتظار
        // = تعداد دانش‌آموزان × تعداد دروس معلم در این دوره
        const totalExpected = studentsCount * relevantPeriodLessons.length;

        // ⬅️ درصد پیشرفت
        const progress =
          totalExpected > 0
            ? Math.round((gradedCount / totalExpected) * 100)
            : 0;

        return {
          ...cls,
          totalStudents: studentsCount,
          totalLessons: relevantPeriodLessons.length,
          gradedCount,
          totalExpected,
          progress,
        };
      }),
    );

    return success({ classes, period });
  } catch (err) {
    console.error("getTeacherClassesInPeriod error:", err);
    return error("خطا در دریافت کلاس‌ها");
  }
}

// ==========================================
// ۴. دریافت دانش‌آموزان کلاس + نمرات
// ==========================================
export async function getClassStudentsWithGrades(
  schoolId: number,
  periodId: string,
  klassId: string,
  lessonId: string, // ⬅️ اضافه شد
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  try {
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        teacher: { userId: currentUser.id },
        schoolId,
        isActive: true,
      },
    });

    if (!assignment) return error("شما به این مدرسه دسترسی ندارید");

    const teacher = await prisma.teacher.findFirst({
      where: { userId: currentUser.id },
    });

    if (!teacher) return error("پروفایل معلم یافت نشد");

    // بررسی کلاس
    const klass = await prisma.klass.findFirst({
      where: {
        id: klassId,
        schoolId,
        academicYearId: assignment.academicYearId,
      },
      include: {
        paye: { select: { title: true } },
        reshtehTahsili: { select: { title: true } },
      },
    });

    if (!klass) return error("کلاس یافت نشد");

    // بررسی درس
    const teacherLesson = await prisma.classCourse.findFirst({
      where: {
        klassId,
        teacherId: teacher.id,
        darsPayeReshtehId: lessonId,
      },
      include: {
        darsPayeReshteh: {
          include: {
            reshtehTadris: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!teacherLesson) {
      return error("شما در این کلاس این درس را تدریس نمی‌کنید");
    }

    // بررسی اینکه درس در دوره هست
    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: {
        gradePeriodId: periodId,
        darsPayeReshtehId: lessonId,
        klassId,
      },
    });

    if (!gradePeriodLesson) {
      return error("این درس در این دوره ثبت نمره نیست");
    }

    // تنظیمات مدرسه
    const settings = await prisma.schoolSettings.findUnique({
      where: { schoolId },
    });

    const gradingType = settings?.gradingType || "NUMERIC";

    // دانش‌آموزان کلاس
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        klassId,
        schoolId,
        academicYearId: assignment.academicYearId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nationalCode: true,
          },
        },
      },
      orderBy: [
        { student: { lastName: "asc" } },
        { student: { firstName: "asc" } },
      ],
    });

    // نمرات این درس
    const grades = await prisma.grade.findMany({
      where: {
        gradePeriodLessonId: gradePeriodLesson.id,
        studentEnrollmentId: { in: enrollments.map((e) => e.id) },
      },
      select: {
        studentEnrollmentId: true,
        score: true,
        descriptiveValue: true,
      },
    });

    const gradesMap = new Map(grades.map((g) => [g.studentEnrollmentId, g]));

    const students = enrollments.map((e) => {
      const grade = gradesMap.get(e.id);
      const value =
        gradingType === "NUMERIC"
          ? (grade?.score ?? "")
          : (grade?.descriptiveValue ?? "");

      return {
        enrollmentId: e.id,
        studentId: e.student.id,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        nationalCode: e.student.nationalCode,
        fullName: `${e.student.firstName} ${e.student.lastName}`,
        currentValue: value,
      };
    });

    return success({
      klass: {
        id: klass.id,
        title: klass.title,
        paye: klass.paye.title,
        reshtehTahsili: klass.reshtehTahsili.title,
      },
      lesson: {
        id: teacherLesson.darsPayeReshtehId,
        title: teacherLesson.darsPayeReshteh.reshtehTadris.title,
        units: teacherLesson.darsPayeReshteh.units,
      },
      students,
      gradingType,
    });
  } catch (err) {
    console.error("getClassStudentsWithGrades error:", err);
    return error("خطا در دریافت دانش‌آموزان");
  }
}

// ==========================================
// ۵. ثبت/به‌روزرسانی نمره
// ==========================================
export async function saveGrade(input: {
  enrollmentId: string;
  darsPayeReshtehId: string;
  periodId: string;
  score: number | null;
  descriptiveValue?: string | null;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  try {
    // بررسی معلم بودن
    const teacher = await prisma.teacher.findFirst({
      where: { userId: currentUser.id },
    });

    if (!teacher) return error("پروفایل معلم یافت نشد");

    const username = currentUser.email || currentUser.name || "unknown";

    // ۱. اعتبارسنجی نمره (0-20)
    if (input.score !== null && input.score !== undefined) {
      if (isNaN(input.score) || input.score < 0 || input.score > 20) {
        return error("نمره باید بین ۰ تا ۲۰ باشد");
      }
    }

    // ۲. پیدا کردن enrollment
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: input.enrollmentId },
      select: { klassId: true },
    });

    if (!enrollment) return error("دانش‌آموز یافت نشد");

    // ۳. پیدا کردن GradePeriodLesson
    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: {
        gradePeriodId: input.periodId,
        darsPayeReshtehId: input.darsPayeReshtehId,
        klassId: enrollment.klassId,
      },
    });

    if (!gradePeriodLesson) return error("درس در این دوره یافت نشد");

    // ۴. اگر نمره خالی است، حذف کن
    const isNumericEmpty =
      input.score === null ||
      input.score === undefined ||
      (typeof input.score === "number" && isNaN(input.score));

    const isDescriptiveEmpty =
      input.descriptiveValue === null ||
      input.descriptiveValue === undefined ||
      input.descriptiveValue === "";

    const isEmpty =
      input.score !== undefined ? isNumericEmpty : isDescriptiveEmpty;

    if (isEmpty) {
      await prisma.grade.deleteMany({
        where: {
          studentEnrollmentId: input.enrollmentId,
          gradePeriodLessonId: gradePeriodLesson.id,
        },
      });

      return success({ message: "نمره حذف شد" });
    }

    // ۵. ذخیره یا به‌روزرسانی (upsert)
    const grade = await prisma.grade.upsert({
      where: {
        studentEnrollmentId_gradePeriodLessonId: {
          studentEnrollmentId: input.enrollmentId,
          gradePeriodLessonId: gradePeriodLesson.id,
        },
      },
      update: {
        score: input.score ?? null,
        descriptiveValue: input.descriptiveValue || null,
        lastEditedByUsername: username,
      },
      create: {
        studentEnrollmentId: input.enrollmentId,
        gradePeriodLessonId: gradePeriodLesson.id,
        score: input.score ?? null,
        descriptiveValue: input.descriptiveValue || null,
        lastEditedByUsername: username,
      },
    });

    return success({
      message: "نمره ذخیره شد",
      gradeId: grade.id,
      score: grade.score,
      descriptiveValue: grade.descriptiveValue,
    });
  } catch (err) {
    console.error("saveGrade error:", err);
    return error("خطا در ثبت نمره");
  }
}
export async function getClassLessonsForGrading(
  schoolId: number,
  periodId: string,
  klassId: string,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  try {
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        teacher: { userId: currentUser.id },
        schoolId,
        isActive: true,
      },
    });

    if (!assignment) return error("شما به این مدرسه دسترسی ندارید");

    const teacher = await prisma.teacher.findFirst({
      where: { userId: currentUser.id },
    });

    if (!teacher) return error("پروفایل معلم یافت نشد");

    // بررسی کلاس
    const klass = await prisma.klass.findFirst({
      where: {
        id: klassId,
        schoolId,
        academicYearId: assignment.academicYearId,
      },
      include: {
        paye: { select: { title: true } },
        reshtehTahsili: { select: { title: true } },
      },
    });

    if (!klass) return error("کلاس یافت نشد");

    // تعداد دانش‌آموزان
    const studentsCount = await prisma.studentEnrollment.count({
      where: {
        klassId,
        schoolId,
        academicYearId: assignment.academicYearId,
      },
    });

    // دروس معلم در این کلاس
    const teacherLessons = await prisma.classCourse.findMany({
      where: {
        klassId,
        teacherId: teacher.id,
      },
      include: {
        darsPayeReshteh: {
          include: {
            reshtehTadris: { select: { id: true, title: true } },
          },
        },
      },
    });

    // دروس این دوره برای این کلاس
    const periodLessons = await prisma.gradePeriodLesson.findMany({
      where: {
        gradePeriodId: periodId,
        klassId,
      },
      select: { id: true, darsPayeReshtehId: true },
    });

    const periodLessonIds = new Set(
      periodLessons.map((l) => l.darsPayeReshtehId),
    );

    // فقط دروسی که در دوره هستند
    const relevantLessons = teacherLessons.filter((l) =>
      periodLessonIds.has(l.darsPayeReshtehId),
    );

    // محاسبه پیشرفت هر درس
    const lessonsWithProgress = await Promise.all(
      relevantLessons.map(async (l) => {
        const gpl = periodLessons.find(
          (pl) => pl.darsPayeReshtehId === l.darsPayeReshtehId,
        );

        const gradedCount = gpl
          ? await prisma.grade.count({
              where: {
                gradePeriodLessonId: gpl.id,
                OR: [
                  { score: { not: null } },
                  { descriptiveValue: { not: null } },
                ],
              },
            })
          : 0;

        return {
          darsPayeReshtehId: l.darsPayeReshtehId,
          lessonTitle: l.darsPayeReshteh.reshtehTadris.title,
          units: l.darsPayeReshteh.units,
          gradedCount,
          totalExpected: studentsCount,
        };
      }),
    );

    return success({
      klass: {
        id: klass.id,
        title: klass.title,
        paye: klass.paye.title,
        reshtehTahsili: klass.reshtehTahsili.title,
      },
      studentsCount,
      lessons: lessonsWithProgress,
    });
  } catch (err) {
    console.error("getClassLessonsForGrading error:", err);
    return error("خطا در دریافت دروس");
  }
}
