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

    const klassesByPaye = new Map<number, string[]>();
    for (const k of validKlasses) {
      if (!klassesByPaye.has(k.payeId)) {
        klassesByPaye.set(k.payeId, []);
      }
      klassesByPaye.get(k.payeId)!.push(k.id);
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
          schoolId,
          academicYearId,
          lastEditedByUsername: username,
        },
      });

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

    const klassesByPaye = new Map<number, string[]>();
    for (const k of validKlasses) {
      if (!klassesByPaye.has(k.payeId)) {
        klassesByPaye.set(k.payeId, []);
      }
      klassesByPaye.get(k.payeId)!.push(k.id);
    }

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
          lastEditedByUsername: username,
        },
      });

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
