// actions/gradePeriodActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { getCurrentContext } from "@/actions/authActions";
import { revalidatePath } from "next/cache";
import {
  createGradePeriodSchema,
  updateGradePeriodSchema,
} from "@/lib/schemas/gradePeriod";

const GRADE_PERIOD_ROUTE = "/dashboard/manager/grade-periods";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

// ==========================================
// ۱. دریافت لیست دوره‌های ثبت نمره
// ==========================================
export async function getGradePeriods(options?: {
  sortField?: string;
  sortOrder?: "asc" | "desc";
  searchField?: string;
  searchValue?: string;
  page?: number;
  pageSize?: number;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { items: [], total: 0 };

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return { items: [], total: 0 };
  }

  if (context.role !== "MANAGER") return { items: [], total: 0 };

  const {
    sortField = "createdAt",
    sortOrder = "desc",
    searchField,
    searchValue,
    page = 1,
    pageSize = 10,
  } = options ?? {};

  const skip = (page - 1) * pageSize;

  const where: any = {
    schoolId: context.schoolId,
    academicYearId: context.academicYearId,
  };

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
              klass: { select: { id: true, title: true } }, // ⬅️ اضافه شد
            },
          },
          _count: {
            select: {
              klassPeriods: true,
              lessonPeriods: true,
            },
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

// ==========================================
// ۲. دریافت اطلاعات کامل کلاس‌ها + دروس
//    برای نمایش در فرم (با ساختار درختی)
// ==========================================
export async function getClassesAndLessonsForPeriod() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return error("کانتکست فعال یافت نشد");
  }

  try {
    // ۱. کلاس‌های مدرسه
    const klasses = await prisma.klass.findMany({
      where: {
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
      include: {
        paye: { select: { id: true, title: true } },
        reshtehTahsili: { select: { id: true, title: true } },
      },
      orderBy: [{ paye: { id: "asc" } }, { title: "asc" }],
    });

    // ۲. دروس مربوط به هر ترکیب (پایه، رشته)
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
        where: {
          payeId: pair.payeId,
          reshtehTahsiliId: pair.reshtehId,
        },
        include: {
          reshtehTadris: { select: { id: true, title: true } },
        },
        orderBy: { reshtehTadris: { title: "asc" } },
      });
      lessonsByPair.set(key, lessons);
    }

    // ۳. ساختار درختی: پایه → کلاس‌ها + دروس
    //    (چون دروس بر اساس پایه و رشته مشترک هستند)
    const payeMap = new Map<
      number,
      {
        payeId: number;
        payeTitle: string;
        klasses: any[];
        lessons: any[]; // union از همه رشته‌ها
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

    // اضافه کردن دروس به هر پایه (با حذف تکراری‌ها)
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

// ==========================================
// ۳. ایجاد دوره ثبت نمره
// ==========================================
export async function createGradePeriod(input: unknown) {
  const parsed = createGradePeriodSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return error("کانتکست فعال یافت نشد");
  }

  if (context.role !== "MANAGER") return error("دسترسی ندارید");

  const username = currentUser.email || currentUser.name || "unknown";

  try {
    // اعتبارسنجی کلاس‌ها
    const validKlasses = await prisma.klass.findMany({
      where: {
        id: { in: parsed.data.klassIds },
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
      select: { id: true, payeId: true },
    });

    if (validKlasses.length !== parsed.data.klassIds.length) {
      return error("برخی از کلاس‌های انتخاب‌شده معتبر نیستند");
    }

    // گروه‌بندی کلاس‌ها بر اساس پایه
    const klassesByPaye = new Map<number, string[]>();
    for (const k of validKlasses) {
      if (!klassesByPaye.has(k.payeId)) {
        klassesByPaye.set(k.payeId, []);
      }
      klassesByPaye.get(k.payeId)!.push(k.id);
    }

    // اعتبارسنجی دروس
    const allLessonIds = parsed.data.lessonsByPaye.flatMap((l) => l.lessonIds);
    const validLessons = await prisma.darsPayeReshteh.findMany({
      where: { id: { in: allLessonIds } },
      select: { id: true },
    });

    if (validLessons.length !== allLessonIds.length) {
      return error("برخی از دروس انتخاب‌شده معتبر نیستند");
    }

    // ایجاد دوره با transaction
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
          schoolId: context.schoolId || 1,
          academicYearId: context.academicYearId || 1,
          lastEditedByUsername: username,
        },
      });

      // ۱. روابط کلاس‌ها
      await tx.gradePeriodKlass.createMany({
        data: parsed.data.klassIds.map((klassId) => ({
          gradePeriodId: period.id,
          klassId,
        })),
        skipDuplicates: true,
      });

      // ۲. ⬅️ روابط دروس: هر درس برای هر کلاسِ پایه‌اش
      const lessonPeriods: {
        gradePeriodId: string;
        darsPayeReshtehId: string;
        klassId: string;
      }[] = [];

      for (const { payeId, lessonIds } of parsed.data.lessonsByPaye) {
        const payeKlassIds = klassesByPaye.get(payeId) || [];
        for (const lessonId of lessonIds) {
          for (const klassId of payeKlassIds) {
            lessonPeriods.push({
              gradePeriodId: period.id,
              darsPayeReshtehId: lessonId,
              klassId,
            });
          }
        }
      }

      // ⬅️ این بخش حیاتی است
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

// ==========================================
// ۴. ویرایش دوره ثبت نمره
// ==========================================
export async function updateGradePeriod(input: unknown) {
  const parsed = updateGradePeriodSchema.safeParse(input);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "داده نامعتبر");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return error("کانتکست فعال یافت نشد");
  }

  const username = currentUser.email || currentUser.name || "unknown";

  try {
    const existing = await prisma.gradePeriod.findFirst({
      where: {
        id: parsed.data.id,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
    });

    if (!existing) return error("دوره یافت نشد");

    // اعتبارسنجی کلاس‌ها
    const validKlasses = await prisma.klass.findMany({
      where: {
        id: { in: parsed.data.klassIds },
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
      select: { id: true, payeId: true, title: true },
    });

    if (validKlasses.length !== parsed.data.klassIds.length) {
      return error("برخی از کلاس‌های انتخاب‌شده معتبر نیستند");
    }

    // اعتبارسنجی دروس
    const allLessonIds = parsed.data.lessonsByPaye.flatMap((l) => l.lessonIds);
    const validLessons = await prisma.darsPayeReshteh.findMany({
      where: { id: { in: allLessonIds } },
      select: { id: true },
    });

    if (validLessons.length !== allLessonIds.length) {
      return error("برخی از دروس انتخاب‌شده معتبر نیستند");
    }

    // گروه‌بندی کلاس‌ها بر اساس پایه
    const klassesByPaye = new Map<number, string[]>();
    for (const k of validKlasses) {
      if (!klassesByPaye.has(k.payeId)) {
        klassesByPaye.set(k.payeId, []);
      }
      klassesByPaye.get(k.payeId)!.push(k.id);
    }

    // ⬅️ مرحله ۱: محاسبه لیست مورد نیاز GradePeriodLesson
    const requiredLessonPeriods: {
      gradePeriodId: string;
      darsPayeReshtehId: string;
      klassId: string;
    }[] = [];

    for (const { payeId, lessonIds } of parsed.data.lessonsByPaye) {
      const payeKlassIds = klassesByPaye.get(payeId) || [];

      for (const lessonId of lessonIds) {
        for (const klassId of payeKlassIds) {
          requiredLessonPeriods.push({
            gradePeriodId: parsed.data.id,
            darsPayeReshtehId: lessonId,
            klassId,
          });
        }
      }
    }

    // ⬅️ مرحله ۲: دریافت GradePeriodLessonهای موجود
    const existingLessonPeriods = await prisma.gradePeriodLesson.findMany({
      where: { gradePeriodId: parsed.data.id },
      select: {
        id: true,
        darsPayeReshtehId: true,
        klassId: true,
      },
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

    // ⬅️ مرحله ۳: پیدا کردن GradePeriodLessonهایی که باید حذف شوند
    const toDeleteIds: string[] = [];
    for (const [key, id] of existingKey) {
      if (!requiredKey.has(key)) {
        toDeleteIds.push(id);
      }
    }

    // ⬅️ مرحله ۴: بررسی اینکه کدام‌ها نمره دارند
    if (toDeleteIds.length > 0) {
      const gradesOnDeleted = await prisma.grade.findMany({
        where: {
          gradePeriodLessonId: { in: toDeleteIds },
        },
        select: {
          gradePeriodLessonId: true,
        },
        distinct: ["gradePeriodLessonId"],
      });

      if (gradesOnDeleted.length > 0) {
        // ⬅️ پیدا کردن اطلاعات کامل برای نمایش خطا
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
            _count: {
              select: { grades: true },
            },
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

      // اگر نمره ندارند، حذف کن
      await prisma.gradePeriodLesson.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
    }

    // ⬅️ مرحله ۵: ساخت GradePeriodLessonهای جدید
    const toCreate = requiredLessonPeriods.filter(
      (l) => !existingKey.has(`${l.darsPayeReshtehId}-${l.klassId}`),
    );

    // ⬅️ حالا تراکنش اصلی
    const result = await prisma.$transaction(async (tx) => {
      // ۱. به‌روزرسانی خود دوره
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
          lastEditedByUsername: username,
        },
      });

      // ۲. به‌روزرسانی کلاس‌ها
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

      // ۳. حذف GradePeriodLessonهای بدون نمره
      if (toDeleteIds.length > 0) {
        await tx.gradePeriodLesson.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      // ۴. اضافه کردن GradePeriodLessonهای جدید
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

// ==========================================
// ۵. حذف دوره ثبت نمره
// ==========================================
export async function deleteGradePeriod(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return error("کانتکست فعال یافت نشد");
  }

  try {
    const existing = await prisma.gradePeriod.findFirst({
      where: {
        id,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
    });

    if (!existing) return error("دوره یافت نشد");

    await prisma.gradePeriod.delete({ where: { id } });

    revalidatePath(GRADE_PERIOD_ROUTE);
    return success({ id });
  } catch (err) {
    console.error("deleteGradePeriod error:", err);
    return error("خطا در حذف دوره");
  }
}

// ==========================================
// ۶. تغییر وضعیت فعال/غیرفعال
// ==========================================
export async function toggleGradePeriodActive(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return error("کانتکست فعال یافت نشد");
  }

  try {
    const existing = await prisma.gradePeriod.findFirst({
      where: {
        id,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
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
