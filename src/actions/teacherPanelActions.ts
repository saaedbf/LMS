// actions/teacherPanelActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { getCurrentContext } from "./authActions";

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
  const context = await getCurrentContext();
  if (!context?.user)
    return { status: "error" as const, error: "کاربر یافت نشد" };

  // ⬅️ دریافت دسترسی‌های کاربر از جدول UserAssignment
  const userAssignments = await prisma.userAssignment.findMany({
    where: {
      userId: context.user.id,
      role: "TEACHER",
      isActive: true,
      school: { isActive: true },
      academicYear: { isActive: true },
    },
    include: {
      school: true,
      academicYear: true,
    },
  });

  if (userAssignments.length === 0) {
    return {
      status: "error" as const,
      error: "هیچ مدرسه‌ای برای شما ثبت نشده است",
    };
  }

  const schoolMap = new Map();

  for (const assignment of userAssignments) {
    const school = assignment.school;
    if (!schoolMap.has(school.id)) {
      schoolMap.set(school.id, {
        schoolId: school.id,
        schoolTitle: school.title,
        schoolSubTitle: school.subTitle,
        schoolSex: school.sex,
        // ⬅️ اینجا assignment.id از جدول UserAssignment است که Int است
        assignmentId: assignment.id,
        academicYears: [],
      });
    }
    const entry = schoolMap.get(school.id);
    if (
      !entry.academicYears.some((y: any) => y.id === assignment.academicYear.id)
    ) {
      entry.academicYears.push({
        id: assignment.academicYear.id,
        title: assignment.academicYear.title,
        isActive: assignment.academicYear.isActive,
      });
    }
  }

  return { status: "success" as const, data: Array.from(schoolMap.values()) };
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
        isVisible: true,
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
  lessonId: string,
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
      include: { gradePeriod: true }, // ⬅️ برای دسترسی به examType
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
        // ⬅️ اضافه شدن فیلدهای تستی
        correctCount: true,
        wrongCount: true,
        blankCount: true,
      },
    });

    const gradesMap = new Map(grades.map((g) => [g.studentEnrollmentId, g]));

    const students = enrollments.map((e) => {
      const grade = gradesMap.get(e.id);
      return {
        enrollmentId: e.id,
        studentId: e.student.id,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        nationalCode: e.student.nationalCode,
        fullName: `${e.student.firstName} ${e.student.lastName}`,
        currentValue:
          gradingType === "NUMERIC"
            ? (grade?.score ?? "")
            : (grade?.descriptiveValue ?? ""),
        // ⬅️ فیلدهای تستی
        correctCount: grade?.correctCount ?? null,
        wrongCount: grade?.wrongCount ?? null,
        blankCount: grade?.blankCount ?? null,
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
        questionCount: gradePeriodLesson.questionCount ?? null, // ⬅️ اضافه شد
      },
      students,
      gradingType,
      // ⬅️ اطلاعات آزمون
      isTest: gradePeriodLesson.gradePeriod.examType === "TEST",
      hasNegativeScore: gradePeriodLesson.gradePeriod.hasNegativeScore,
      isPeriodActive: gradePeriodLesson.gradePeriod.isActive, // ⬅️ اضافه شد
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
  correctCount?: number | null;
  wrongCount?: number | null;
  blankCount?: number | null;
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

    // ۱. اعتبارسنجی نمره عادی (0-20)
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
      include: { gradePeriod: true }, // ⬅️ برای دسترسی به examType و hasNegativeScore
    });

    if (!gradePeriodLesson) return error("درس در این دوره یافت نشد");
    // ⬅️ بررسی فعال بودن دوره
    if (!gradePeriodLesson.gradePeriod.isActive) {
      return error("این دوره غیرفعال است. شما امکان ویرایش نمرات را ندارید.");
    }
    const isTest = gradePeriodLesson.gradePeriod.examType === "TEST";

    // ۴. منطق خالی بودن بر اساس نوع آزمون
    let isEmpty = false;
    if (isTest) {
      // اگر هر سه فیلد تستی خالی بودند
      isEmpty =
        (input.correctCount === null || input.correctCount === undefined) &&
        (input.wrongCount === null || input.wrongCount === undefined) &&
        (input.blankCount === null || input.blankCount === undefined);
    } else {
      const isNumericEmpty =
        input.score === null ||
        input.score === undefined ||
        (typeof input.score === "number" && isNaN(input.score));

      const isDescriptiveEmpty =
        input.descriptiveValue === null ||
        input.descriptiveValue === undefined ||
        input.descriptiveValue === "";

      isEmpty = input.score !== undefined ? isNumericEmpty : isDescriptiveEmpty;
    }

    // حذف نمره در صورت خالی بودن
    if (isEmpty) {
      await prisma.grade.deleteMany({
        where: {
          studentEnrollmentId: input.enrollmentId,
          gradePeriodLessonId: gradePeriodLesson.id,
        },
      });

      return success({ message: "نمره حذف شد" });
    }

    // ⬅️ محاسبه نمره نهایی برای آزمون تستی
    let finalScore = input.score;

    if (isTest) {
      const correct = input.correctCount || 0;
      const wrong = input.wrongCount || 0;
      const questionCount = gradePeriodLesson.questionCount || 1;
      const hasNegative = gradePeriodLesson.gradePeriod.hasNegativeScore;

      let rawScore = correct;
      if (hasNegative) {
        rawScore = correct - wrong / 3;
      }

      // جلوگیری از منفی شدن
      if (rawScore < 0) rawScore = 0;

      const percentage = (rawScore / questionCount) * 100;
      finalScore = Math.min((percentage / 100) * 20, 20); // نهایتاً ۲۰
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
        score: finalScore ?? null,
        descriptiveValue: input.descriptiveValue || null,
        // ⬅️ ذخیره فیلدهای تستی
        correctCount: input.correctCount ?? null,
        wrongCount: input.wrongCount ?? null,
        blankCount: input.blankCount ?? null,
        lastEditedByUsername: username,
      },
      create: {
        studentEnrollmentId: input.enrollmentId,
        gradePeriodLessonId: gradePeriodLesson.id,
        score: finalScore ?? null,
        descriptiveValue: input.descriptiveValue || null,
        // ⬅️ ذخیره فیلدهای تستی
        correctCount: input.correctCount ?? null,
        wrongCount: input.wrongCount ?? null,
        blankCount: input.blankCount ?? null,
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

export async function deleteGradeByTeacher(gradeId: string) {
  const context = await getCurrentContext();

  if (!context?.user || context.role !== "TEACHER") {
    return { status: "error" as const, error: "دسترسی غیرمجاز" };
  }

  try {
    // ۱. بررسی اینکه این نمره متعلق به کلاسی است که این معلم درس می‌دهد
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        gradePeriodLesson: {
          include: {
            darsPayeReshteh: {
              include: {
                classCourses: {
                  where: {
                    teacher: { userId: context.user.id }, // معلم جاری
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!grade) return { status: "error" as const, error: "نمره یافت نشد" };

    // اگر معلم به این درس دسترسی ندارد
    if (grade.gradePeriodLesson.darsPayeReshteh.classCourses.length === 0) {
      return {
        status: "error" as const,
        error: "شما مجاز به حذف این نمره نیستید",
      };
    }

    // ۲. حذف نمره
    await prisma.grade.delete({
      where: { id: gradeId },
    });

    // ⬅️ آدرس صفحه‌ای که معلم در آن است را برای رفرش کردن پاس دهید
    // اینجا باید آدرس داینامیک را پاس دهید.
    // برای سادگی، از revalidatePath با الگوی داینامیک استفاده می‌کنیم:
    revalidatePath("/teacher", "layout");

    return { status: "success" as const, data: true };
  } catch (error) {
    console.error("DELETE_GRADE_ERROR", error);
    return { status: "error" as const, error: "خطا در حذف نمره" };
  }
}
export async function bulkSaveGrades(input: {
  periodId: string;
  lessonId: string;
  klassId: string;
  grades: {
    nationalCode: string;
    value?: string | number;
    correctCount?: number;
    wrongCount?: number;
    blankCount?: number;
  }[];
  gradingType: "NUMERIC" | "DESCRIPTIVE";
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { status: "error" as const, error: "ابتدا وارد حساب کاربری شوید" };
  }

  try {
    // ۱. بررسی معلم بودن
    const teacher = await prisma.teacher.findFirst({
      where: { userId: currentUser.id },
    });

    if (!teacher) {
      return { status: "error" as const, error: "پروفایل معلم یافت نشد" };
    }

    const username = currentUser.email || currentUser.name || "unknown";

    // ۲. پیدا کردن درس در دوره
    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: {
        gradePeriodId: input.periodId,
        darsPayeReshtehId: input.lessonId,
        klassId: input.klassId,
      },
      include: { gradePeriod: true },
    });

    if (!gradePeriodLesson) {
      return { status: "error" as const, error: "درس در این دوره یافت نشد" };
    }
    // ⬅️ بررسی فعال بودن دوره
    if (!gradePeriodLesson.gradePeriod.isActive) {
      return error("این دوره غیرفعال است. شما امکان ویرایش نمرات را ندارید.");
    }
    const isTest = gradePeriodLesson.gradePeriod.examType === "TEST";
    const hasNegative = gradePeriodLesson.gradePeriod.hasNegativeScore;
    const qCount = gradePeriodLesson.questionCount || 1;

    // ۳. گرفتن دانش‌آموزان کلاس
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { klassId: input.klassId },
      include: { student: { select: { nationalCode: true } } },
    });

    // نگاشت کد ملی (با نرمال‌سازی ۱۰ رقمی)
    const enrollmentMap = new Map(
      enrollments.map((e) => {
        let code = e.student.nationalCode.replace(/\D/g, "");
        if (code.length === 8) code = "00" + code;
        else if (code.length === 9) code = "0" + code;
        return [code, e.id];
      }),
    );

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // ۴. پردازش هر ردیف
    for (const item of input.grades) {
      let cleanCode = String(item.nationalCode).replace(/\D/g, "");
      if (cleanCode.length === 8) cleanCode = "00" + cleanCode;
      else if (cleanCode.length === 9) cleanCode = "0" + cleanCode;

      const enrollmentId = enrollmentMap.get(cleanCode);

      if (!enrollmentId) {
        skipped++;
        errors.push(`کد ملی ${item.nationalCode} در این کلاس یافت نشد`);
        continue;
      }

      let finalScore: number | null = null;
      let descriptiveValue: string | null = null;
      let correctCount: number | null = null;
      let wrongCount: number | null = null;
      let blankCount: number | null = null;

      if (isTest) {
        // ⬅️ حالت تستی
        const correct = item.correctCount || 0;
        const wrong = item.wrongCount || 0;
        const blank = item.blankCount || 0;

        correctCount = correct;
        wrongCount = wrong;
        blankCount = blank;

        let rawScore = correct;
        if (hasNegative) rawScore = correct - wrong / 3;
        if (rawScore < 0) rawScore = 0;

        const percentage = (rawScore / qCount) * 100;
        finalScore = Math.min((percentage / 100) * 20, 20);
      } else {
        // ⬅️ حالت عادی
        if (input.gradingType === "NUMERIC") {
          const num = Number(item.value);
          if (isNaN(num) || num < 0 || num > 20) {
            skipped++;
            errors.push(
              `نمره ${item.value} برای کد ملی ${item.nationalCode} نامعتبر است`,
            );
            continue;
          }
          finalScore = num;
        } else {
          descriptiveValue = String(item.value).trim();
        }
      }

      // ذخیره یا به‌روزرسانی
      const existing = await prisma.grade.findUnique({
        where: {
          studentEnrollmentId_gradePeriodLessonId: {
            studentEnrollmentId: enrollmentId,
            gradePeriodLessonId: gradePeriodLesson.id,
          },
        },
      });

      if (existing) {
        await prisma.grade.update({
          where: { id: existing.id },
          data: {
            score: finalScore,
            descriptiveValue,
            correctCount,
            wrongCount,
            blankCount,
            lastEditedByUsername: username,
          },
        });
        updated++;
      } else {
        await prisma.grade.create({
          data: {
            studentEnrollmentId: enrollmentId,
            gradePeriodLessonId: gradePeriodLesson.id,
            score: finalScore,
            descriptiveValue,
            correctCount,
            wrongCount,
            blankCount,
            lastEditedByUsername: username,
          },
        });
        created++;
      }
    }

    revalidatePath("/teacher");
    return {
      status: "success" as const,
      data: { created, updated, skipped, errors },
    };
  } catch (err: any) {
    console.error("bulkSaveGrades error:", err);
    return { status: "error" as const, error: "خطا در ثبت گروهی نمرات" };
  }
}
