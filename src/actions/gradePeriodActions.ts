"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import {
  createGradePeriodSchema,
  updateGradePeriodSchema,
} from "@/lib/schemas/gradePeriod";
import { getCurrentContext } from "./authActions";
import { parseExamString } from "@/lib/utils/examParser";

const GRADE_PERIOD_ROUTE = "/dashboard/manager/grade-periods";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

export async function getGradePeriods(options?: {
  sortField?: string;
  sortOrder?: "asc" | "desc";
  searchField?: string;
  searchValue?: string;
  page?: number;
  pageSize?: number;
}) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return { items: [], total: 0 };

  const { schoolId, academicYearId } = scope;

  const {
    sortField = "createdAt",
    sortOrder = "desc",
    searchField,
    searchValue,
    page = 1,
    pageSize = 10,
  } = options ?? {};

  const skip = (page - 1) * pageSize;

  const where: any = { schoolId, academicYearId };

  if (searchField && searchValue?.trim()) {
    const val = searchValue.trim();
    if (searchField === "title") {
      where.title = { contains: val, mode: "insensitive" };
    } else if (searchField === "description") {
      where.description = { contains: val, mode: "insensitive" };
    }
  }

  let orderBy: any = { createdAt: sortOrder };
  if (sortField === "title") orderBy = { title: sortOrder };

  try {
    const [items, total] = await prisma.$transaction([
      prisma.gradePeriod.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          klassPeriods: {
            include: {
              klass: {
                include: {
                  paye: { select: { id: true, title: true } },
                  reshtehTahsili: { select: { id: true, title: true } },
                },
              },
            },
          },
          lessonPeriods: {
            include: {
              darsPayeReshteh: {
                include: {
                  reshtehTadris: { select: { id: true, title: true } },
                  paye: { select: { id: true, title: true } },
                  reshtehTahsili: { select: { id: true, title: true } },
                },
              },
              klass: { select: { id: true, title: true } },
            },
          },
          _count: {
            select: { klassPeriods: true, lessonPeriods: true },
          },
        },
      }),
      prisma.gradePeriod.count({ where }),
    ]);

    return { items, total };
  } catch (err) {
    console.error("getGradePeriods error:", err);
    return { items: [], total: 0 };
  }
}

export async function getClassesAndLessonsForPeriod() {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId } = scope;

  try {
    const klasses = await prisma.klass.findMany({
      where: { schoolId, academicYearId },
      include: {
        paye: { select: { id: true, title: true } },
        reshtehTahsili: { select: { id: true, title: true } },
      },
      orderBy: [{ paye: { id: "asc" } }, { title: "asc" }],
    });

    const payeReshtehPairs = new Map<
      string,
      { payeId: number; reshtehId: number }
    >();
    for (const k of klasses) {
      const key = `${k.payeId}-${k.reshtehTahsiliId}`;
      if (!payeReshtehPairs.has(key)) {
        payeReshtehPairs.set(key, {
          payeId: k.payeId,
          reshtehId: k.reshtehTahsiliId,
        });
      }
    }

    const lessonsByPair = new Map<string, any[]>();

    for (const [key, pair] of payeReshtehPairs) {
      const lessons = await prisma.darsPayeReshteh.findMany({
        where: { payeId: pair.payeId, reshtehTahsiliId: pair.reshtehId },
        include: { reshtehTadris: { select: { id: true, title: true } } },
        orderBy: { reshtehTadris: { title: "asc" } },
      });
      lessonsByPair.set(key, lessons);
    }

    const payeMap = new Map<
      number,
      {
        payeId: number;
        payeTitle: string;
        klasses: any[];
        lessons: any[];
      }
    >();

    for (const k of klasses) {
      if (!payeMap.has(k.payeId)) {
        payeMap.set(k.payeId, {
          payeId: k.payeId,
          payeTitle: k.paye.title,
          klasses: [],
          lessons: [],
        });
      }
      const entry = payeMap.get(k.payeId)!;
      entry.klasses.push({
        id: k.id,
        title: k.title,
        reshtehTahsiliId: k.reshtehTahsiliId,
        reshtehTahsiliTitle: k.reshtehTahsili.title,
      });
    }

    for (const [key, lessons] of lessonsByPair) {
      const [payeIdStr] = key.split("-");
      const payeId = Number(payeIdStr);
      const entry = payeMap.get(payeId);
      if (!entry) continue;

      for (const lesson of lessons) {
        if (!entry.lessons.find((l) => l.id === lesson.id)) {
          entry.lessons.push({
            id: lesson.id,
            title: lesson.reshtehTadris.title,
            units: lesson.units,
            reshtehTahsiliId: lesson.reshtehTahsiliId,
            payeId: lesson.payeId,
          });
        }
      }
    }

    return success(Array.from(payeMap.values()));
  } catch (err) {
    console.error("getClassesAndLessonsForPeriod error:", err);
    return error("خطا در دریافت اطلاعات");
  }
}

export async function createGradePeriod(input: unknown) {
  const parsed = createGradePeriodSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId, username } = scope;

  try {
    const validKlasses = await prisma.klass.findMany({
      where: {
        id: { in: parsed.data.klassIds },
        schoolId,
        academicYearId,
      },
      select: { id: true, payeId: true },
    });

    if (validKlasses.length !== parsed.data.klassIds.length) {
      return error("برخی از کلاس‌های انتخاب‌شده معتبر نیستند");
    }

    const allLessonIds = parsed.data.lessonsByPaye.flatMap((l) => l.lessonIds);
    const validLessons = await prisma.darsPayeReshteh.findMany({
      where: { id: { in: allLessonIds } },
      select: { id: true },
    });

    if (validLessons.length !== allLessonIds.length) {
      return error("برخی از دروس انتخاب‌شده معتبر نیستند");
    }

    const result = await prisma.$transaction(async (tx) => {
      const period = await tx.gradePeriod.create({
        data: {
          title: parsed.data.title,
          description: parsed.data.description || null,
          startDate: parsed.data.startDate
            ? new Date(parsed.data.startDate)
            : null,
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
          isActive: parsed.data.isActive,
          isVisible: parsed.data.isVisible, // ⬅️ اضافه شد
          schoolId,
          academicYearId,
          // ⬅️ اضافه شدن فیلدهای جدید
          examType: parsed.data.examType,
          hasNegativeScore: parsed.data.hasNegativeScore,
          lastEditedByUsername: username,
        },
      });

      // ایجاد رابطه دوره با کلاس‌ها (برای نمایش در جدول)
      await tx.gradePeriodKlass.createMany({
        data: parsed.data.klassIds.map((klassId) => ({
          gradePeriodId: period.id,
          klassId,
        })),
        skipDuplicates: true,
      });

      const lessonPeriods: {
        gradePeriodId: string;
        darsPayeReshtehId: string;
        klassId: string;
      }[] = [];

      // ⬅️ اصلاح اصلی: گرفتن تمام کلاس‌های فعلی آن پایه
      for (const { payeId, lessonIds } of parsed.data.lessonsByPaye) {
        const payeKlasses = await tx.klass.findMany({
          where: { schoolId, academicYearId, payeId },
          select: { id: true },
        });

        for (const lessonId of lessonIds) {
          for (const klass of payeKlasses) {
            lessonPeriods.push({
              gradePeriodId: period.id,
              darsPayeReshtehId: lessonId,
              klassId: klass.id,
            });
          }
        }
      }

      if (lessonPeriods.length > 0) {
        await tx.gradePeriodLesson.createMany({
          data: lessonPeriods,
          skipDuplicates: true,
        });
      }

      return period;
    });

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success(result);
  } catch (err) {
    console.error("createGradePeriod error:", err);
    return error("خطا در ایجاد دوره");
  }
}

export async function updateGradePeriod(input: unknown) {
  const parsed = updateGradePeriodSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId, username } = scope;

  try {
    const existing = await prisma.gradePeriod.findFirst({
      where: { id: parsed.data.id, schoolId, academicYearId },
    });

    if (!existing) return error("دوره یافت نشد");

    const validKlasses = await prisma.klass.findMany({
      where: {
        id: { in: parsed.data.klassIds },
        schoolId,
        academicYearId,
      },
      select: { id: true, payeId: true, title: true },
    });

    if (validKlasses.length !== parsed.data.klassIds.length) {
      return error("برخی از کلاس‌های انتخاب‌شده معتبر نیستند");
    }

    const allLessonIds = parsed.data.lessonsByPaye.flatMap((l) => l.lessonIds);
    const validLessons = await prisma.darsPayeReshteh.findMany({
      where: { id: { in: allLessonIds } },
      select: { id: true },
    });

    if (validLessons.length !== allLessonIds.length) {
      return error("برخی از دروس انتخاب‌شده معتبر نیستند");
    }

    const requiredLessonPeriods: {
      gradePeriodId: string;
      darsPayeReshtehId: string;
      klassId: string;
    }[] = [];

    // ⬅️ اصلاح اصلی: گرفتن تمام کلاس‌های فعلی آن پایه
    for (const { payeId, lessonIds } of parsed.data.lessonsByPaye) {
      const payeKlasses = await prisma.klass.findMany({
        where: { schoolId, academicYearId, payeId },
        select: { id: true },
      });

      for (const lessonId of lessonIds) {
        for (const klass of payeKlasses) {
          requiredLessonPeriods.push({
            gradePeriodId: parsed.data.id,
            darsPayeReshtehId: lessonId,
            klassId: klass.id,
          });
        }
      }
    }

    const existingLessonPeriods = await prisma.gradePeriodLesson.findMany({
      where: { gradePeriodId: parsed.data.id },
      select: { id: true, darsPayeReshtehId: true, klassId: true },
    });

    const existingKey = new Map(
      existingLessonPeriods.map((l) => [
        `${l.darsPayeReshtehId}-${l.klassId}`,
        l.id,
      ]),
    );

    const requiredKey = new Set(
      requiredLessonPeriods.map((l) => `${l.darsPayeReshtehId}-${l.klassId}`),
    );

    const toDeleteIds: string[] = [];
    for (const [key, id] of existingKey) {
      if (!requiredKey.has(key)) {
        toDeleteIds.push(id);
      }
    }

    if (toDeleteIds.length > 0) {
      const gradesOnDeleted = await prisma.grade.findMany({
        where: { gradePeriodLessonId: { in: toDeleteIds } },
        select: { gradePeriodLessonId: true },
        distinct: ["gradePeriodLessonId"],
      });

      if (gradesOnDeleted.length > 0) {
        const deletedIdsWithGrades = gradesOnDeleted.map(
          (g) => g.gradePeriodLessonId,
        );

        const details = await prisma.gradePeriodLesson.findMany({
          where: { id: { in: deletedIdsWithGrades } },
          include: {
            darsPayeReshteh: {
              include: {
                reshtehTadris: { select: { title: true } },
                paye: { select: { title: true } },
              },
            },
            klass: { select: { title: true } },
            _count: { select: { grades: true } },
          },
        });

        const lines = details.map(
          (d) =>
            `• ${d.klass.title} - ${d.darsPayeReshteh.reshtehTadris.title} (${d._count.grades} نمره)`,
        );

        return error(
          `امکان حذف دروس زیر وجود ندارد چون نمره ثبت شده دارند:\n${lines.join("\n")}\n\nابتدا نمرات را حذف کنید یا این دروس را در دوره نگه دارید.`,
        );
      }

      await prisma.gradePeriodLesson.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
    }

    const toCreate = requiredLessonPeriods.filter(
      (l) => !existingKey.has(`${l.darsPayeReshtehId}-${l.klassId}`),
    );

    const result = await prisma.$transaction(async (tx) => {
      const period = await tx.gradePeriod.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          description: parsed.data.description || null,
          startDate: parsed.data.startDate
            ? new Date(parsed.data.startDate)
            : null,
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
          isActive: parsed.data.isActive,
          isVisible: parsed.data.isVisible, // ⬅️ اضافه شد
          // ⬅️ اضافه شدن فیلدهای جدید
          examType: parsed.data.examType,
          hasNegativeScore: parsed.data.hasNegativeScore,
          lastEditedByUsername: username,
        },
      });

      // آپدیت کلاس‌های دوره
      await tx.gradePeriodKlass.deleteMany({
        where: {
          gradePeriodId: period.id,
          klassId: { notIn: parsed.data.klassIds },
        },
      });

      const existingKlassIds = (
        await tx.gradePeriodKlass.findMany({
          where: { gradePeriodId: period.id },
          select: { klassId: true },
        })
      ).map((k) => k.klassId);

      const newKlassIds = parsed.data.klassIds.filter(
        (id) => !existingKlassIds.includes(id),
      );

      if (newKlassIds.length > 0) {
        await tx.gradePeriodKlass.createMany({
          data: newKlassIds.map((klassId) => ({
            gradePeriodId: period.id,
            klassId,
          })),
          skipDuplicates: true,
        });
      }

      if (toDeleteIds.length > 0) {
        await tx.gradePeriodLesson.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      if (toCreate.length > 0) {
        await tx.gradePeriodLesson.createMany({
          data: toCreate,
          skipDuplicates: true,
        });
      }

      return period;
    });

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success({
      ...result,
      added: toCreate.length,
      removed: toDeleteIds.length,
    });
  } catch (err) {
    console.error("updateGradePeriod error:", err);
    return error("خطا در ویرایش دوره");
  }
}
export async function toggleGradePeriodVisibility(id: string) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const existing = await prisma.gradePeriod.findFirst({
      where: {
        id,
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
    });

    if (!existing) return error("دوره یافت نشد");

    const updated = await prisma.gradePeriod.update({
      where: { id },
      data: { isVisible: !existing.isVisible },
    });

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success(updated);
  } catch (err) {
    console.error("toggleGradePeriodVisibility error:", err);
    return error("خطا در تغییر وضعیت نمایش");
  }
}
export async function deleteGradePeriod(id: string) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const existing = await prisma.gradePeriod.findFirst({
      where: {
        id,
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
      include: {
        lessonPeriods: {
          select: {
            id: true,
            darsPayeReshteh: {
              select: {
                reshtehTadris: { select: { title: true } },
              },
            },
            klass: { select: { title: true } },
          },
        },
      },
    });

    if (!existing) return error("دوره یافت نشد");

    const lessonPeriodIds = existing.lessonPeriods.map((lp) => lp.id);

    if (lessonPeriodIds.length > 0) {
      const gradesCount = await prisma.grade.count({
        where: {
          gradePeriodLessonId: { in: lessonPeriodIds },
        },
      });

      if (gradesCount > 0) {
        const lessonsWithGrades = await prisma.gradePeriodLesson.findMany({
          where: {
            id: { in: lessonPeriodIds },
            grades: { some: {} },
          },
          select: {
            klass: { select: { title: true } },
            darsPayeReshteh: {
              select: { reshtehTadris: { select: { title: true } } },
            },
          },
        });

        const lines = lessonsWithGrades.map(
          (l) =>
            `• ${l.klass.title} - ${l.darsPayeReshteh.reshtehTadris.title}`,
        );

        return error(
          `امکان حذف این دوره وجود ندارد زیرا در برخی از دروس آن نمره ثبت شده است:\n${lines.join("\n")}\n\nابتدا نمرات را حذف کنید یا دوره را غیرفعال کنید.`,
        );
      }
    }

    await prisma.gradePeriod.delete({ where: { id } });

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success({ id });
  } catch (err) {
    console.error("deleteGradePeriod error:", err);
    return error("خطا در حذف دوره");
  }
}

export async function toggleGradePeriodActive(id: string) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const existing = await prisma.gradePeriod.findFirst({
      where: {
        id,
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
    });

    if (!existing) return error("دوره یافت نشد");

    const updated = await prisma.gradePeriod.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success(updated);
  } catch (err) {
    console.error("toggleGradePeriodActive error:", err);
    return error("خطا در تغییر وضعیت");
  }
}
export async function updateLessonExamSettings(
  gradePeriodId: string,
  settings: {
    gradePeriodLessonIds: string[]; // ⬅️ حالا یک لیست از IDها می‌گیریم
    questionCount: number;
    questionRange: string;
  }[],
) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    // جمع کردن همه‌ی ID ها برای آپدیت دسته‌جمعی
    const allIds = settings.flatMap((s) => s.gradePeriodLessonIds);

    // استفاده از Promise.all برای سرعت بیشتر
    await prisma.$transaction(
      settings.flatMap((item) =>
        item.gradePeriodLessonIds.map((id) =>
          prisma.gradePeriodLesson.update({
            where: { id },
            data: {
              questionCount: item.questionCount,
              questionRange: item.questionRange,
            },
          }),
        ),
      ),
    );

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success({
      message: "تنظیمات آزمون با موفقیت برای همه کلاس‌ها ذخیره شد",
    });
  } catch (err) {
    console.error("updateLessonExamSettings error:", err);
    return error("خطا در ذخیره تنظیمات آزمون");
  }
}
// ==========================================
// گرفتن لیست پایه‌هایی که در این دوره درس تستی دارن
// (برای انتخاب پایه در مودال‌ها)
// ==========================================
export async function getPayesForExam(gradePeriodId: string) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  try {
    const lessons = await prisma.gradePeriodLesson.findMany({
      where: {
        gradePeriodId,
        gradePeriod: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
          examType: "TEST",
        },
      },
      include: {
        darsPayeReshteh: {
          include: { paye: { select: { id: true, title: true } } },
        },
      },
    });

    const payeMap = new Map<number, { payeId: number; payeTitle: string }>();
    for (const l of lessons) {
      const p = l.darsPayeReshteh.paye;
      if (!payeMap.has(p.id)) {
        payeMap.set(p.id, { payeId: p.id, payeTitle: p.title });
      }
    }

    return success(Array.from(payeMap.values()));
  } catch (err) {
    console.error("getPayesForExam error:", err);
    return error("خطا در گرفتن پایه‌ها");
  }
}

// ==========================================
// ذخیره کلید برای کل یک پایه (روی همه دروس تستی آن پایه)
// ⚠️ فقط answerKey و questionCount آپدیت می‌شن. نمرات دست نمی‌خورن.
// ==========================================
export async function saveExamKeyForPaye(input: {
  gradePeriodId: string;
  payeId: number;
  keyString: string;
}) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  const parsedKey = parseExamString(input.keyString);
  const questionCount = Object.keys(parsedKey).length;
  if (questionCount === 0) {
    return error("فرمت کلید نامعتبر است");
  }

  try {
    // همه GradePeriodLessonهای این پایه در این دوره
    const lessons = await prisma.gradePeriodLesson.findMany({
      where: {
        gradePeriodId: input.gradePeriodId,
        darsPayeReshteh: { payeId: input.payeId },
        gradePeriod: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
        },
      },
      select: { id: true },
    });

    if (lessons.length === 0) {
      return error("درسی برای این پایه یافت نشد");
    }

    await prisma.$transaction(
      lessons.map((l) =>
        prisma.gradePeriodLesson.update({
          where: { id: l.id },
          data: {
            answerKey: parsedKey,
            questionCount,
          },
        }),
      ),
    );

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success({
      count: lessons.length,
      questionCount,
    });
  } catch (err) {
    console.error("saveExamKeyForPaye error:", err);
    return error("خطا در ذخیره کلید");
  }
}

// ==========================================
// گرفتن کلید فعلی یک پایه (برای پر کردن فرم ویرایش)
// ==========================================
export async function getExamKeyForPaye(gradePeriodId: string, payeId: number) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return { answerKey: null, questionCount: null };

  const lesson = await prisma.gradePeriodLesson.findFirst({
    where: {
      gradePeriodId,
      darsPayeReshteh: { payeId },
      gradePeriod: {
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
    },
    select: { answerKey: true, questionCount: true },
  });

  if (!lesson) return { answerKey: null, questionCount: null };
  return {
    answerKey: lesson.answerKey as Record<string, number> | null,
    questionCount: lesson.questionCount,
  };
}

// ==========================================
// ثبت گروهی پاسخ‌ها برای کل یک پایه
// ⚠️ فقط studentAnswers آپدیت می‌شه. نمرات دست نمی‌خورن.
// ==========================================
export async function bulkSaveStudentAnswersByPaye(input: {
  gradePeriodId: string;
  payeId: number;
  rows: { nationalCode: string; answers: string }[];
}) {
  const scope = await getScope(PERMISSIONS.MANAGE_GRADE_PERIODS);
  if (isScopeError(scope)) return error(scope.error);

  const { schoolId, academicYearId } = scope;

  try {
    // همه GradePeriodLessonهای این پایه در این دوره
    const lessons = await prisma.gradePeriodLesson.findMany({
      where: {
        gradePeriodId: input.gradePeriodId,
        darsPayeReshteh: { payeId: input.payeId },
        gradePeriod: { schoolId, academicYearId },
      },
      select: { id: true, klassId: true },
    });
    if (lessons.length === 0) return error("درسی برای این پایه یافت نشد");

    // Map کلاس → همه GradePeriodLessonهای اون کلاس برای این پایه
    const lessonsByKlassId = new Map<string, string[]>();
    for (const l of lessons) {
      const arr = lessonsByKlassId.get(l.klassId) ?? [];
      arr.push(l.id);
      lessonsByKlassId.set(l.klassId, arr);
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId,
        academicYearId,
        payeId: input.payeId,
        klassId: { in: lessons.map((l) => l.klassId) },
      },
      include: { student: { select: { nationalCode: true } } },
    });

    const normalize = (code: string) => {
      let c = String(code).replace(/\D/g, "");
      if (c.length === 8) c = "00" + c;
      else if (c.length === 9) c = "0" + c;
      return c;
    };

    const enrollmentMap = new Map(
      enrollments.map((e) => [normalize(e.student.nationalCode), e]),
    );

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of input.rows) {
      const code = normalize(row.nationalCode);
      const enrollment = enrollmentMap.get(code);

      if (!enrollment) {
        skipped++;
        errors.push(`کد ملی ${row.nationalCode} در این پایه یافت نشد`);
        continue;
      }

      const lessonIds = lessonsByKlassId.get(enrollment.klassId);
      if (!lessonIds || lessonIds.length === 0) {
        skipped++;
        errors.push(
          `کلاس دانش‌آموز با کد ملی ${row.nationalCode} در این درس‌ها ثبت نشده`,
        );
        continue;
      }

      const parsedAnswers = parseExamString(row.answers);
      if (Object.keys(parsedAnswers).length === 0) {
        skipped++;
        errors.push(`فرمت پاسخ‌های کد ملی ${row.nationalCode} نامعتبر است`);
        continue;
      }

      // ⬅️ نکته کلیدی: پاسخ روی همه دروس اون کلاس (در این پایه) ذخیره می‌شه
      const existingGrades = await prisma.grade.findMany({
        where: {
          studentEnrollmentId: enrollment.id,
          gradePeriodLessonId: { in: lessonIds },
        },
        select: { id: true },
      });

      if (existingGrades.length > 0) {
        await prisma.grade.updateMany({
          where: { id: { in: existingGrades.map((g) => g.id) } },
          data: { studentAnswers: parsedAnswers },
        });
        updated++;
      } else {
        // اگه هیچ Grade وجود نداره، برای درس اول ایجاد می‌کنیم
        // (score و بقیه فیلدها null می‌مونن)
        await prisma.grade.create({
          data: {
            studentEnrollmentId: enrollment.id,
            gradePeriodLessonId: lessonIds[0],
            studentAnswers: parsedAnswers,
          },
        });
        updated++;
      }
    }

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success({ updated, skipped, errors });
  } catch (err) {
    console.error("bulkSaveStudentAnswersByPaye error:", err);
    return error("خطا در ثبت گروهی پاسخ‌ها");
  }
}
