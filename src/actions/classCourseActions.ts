// actions/classCourseActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { getCurrentContext } from "@/actions/authActions";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CLASS_COURSES_ROUTE = "/dashboard/manager/class-courses";

type ActionSuccess<T> = { status: "success"; data: T };
type ActionError = { status: "error"; error: string };

function success<T>(data: T): ActionSuccess<T> {
  return { status: "success", data };
}

function error(message: string): ActionError {
  return { status: "error", error: message };
}

// ==========================================
// ۱. دریافت لیست دروس کلاس‌ها با join
//    منبع: Klass + DarsPayeReshteh
//    معلم: left join با ClassCourse
// ==========================================
export async function getClassCoursesWithJoin(options?: {
  sortField?: string;
  sortOrder?: "asc" | "desc";
  searchField?: string;
  searchValue?: string;
  page?: number;
  pageSize?: number;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { items: [], total: 0 };
  }

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return { items: [], total: 0 };
  }

  if (context.role !== "MANAGER") {
    return { items: [], total: 0 };
  }

  const {
    sortField = "klass",
    sortOrder = "asc",
    searchField,
    searchValue,
    page = 1,
    pageSize = 10,
  } = options ?? {};

  const skip = (page - 1) * pageSize;

  // ۱. کلاس‌های مدرسه و سال تحصیلی جاری
  const klassWhere: any = {
    schoolId: context.schoolId,
    academicYearId: context.academicYearId,
  };

  // ۲. جستجو
  if (searchField && searchValue?.trim()) {
    const val = searchValue.trim();

    switch (searchField) {
      case "paye":
        klassWhere.paye = {
          title: { contains: val, mode: "insensitive" },
        };
        break;
      case "klass":
        klassWhere.title = { contains: val, mode: "insensitive" };
        break;
      case "lesson":
        // جستجو در درس از طریق relation
        break;
      case "teacher":
        // جستجو در معلم از طریق relation
        break;
    }
  }

  // ۳. مرتب‌سازی
  let orderBy: any = { title: sortOrder };
  switch (sortField) {
    case "paye":
      orderBy = { paye: { id: sortOrder } };
      break;
    case "klass":
      orderBy = { title: sortOrder };
      break;
    case "lesson":
      orderBy = { title: sortOrder };
      break;
    case "teacher":
      orderBy = { title: sortOrder };
      break;
  }

  try {
    // ۱. کلاس‌ها را با فیلتر بگیر
    const classes = await prisma.klass.findMany({
      where: klassWhere,
      include: {
        paye: { select: { id: true, title: true } },
        reshtehTahsili: { select: { id: true, title: true } },
      },
      orderBy,
    });

    if (classes.length === 0) {
      return { items: [], total: 0 };
    }

    // ۲. برای هر کلاس، تمام دروس پایه و رشته را بگیر
    //    و با ClassCourse (معلم) left join کن
    const allItems: any[] = [];

    for (const klass of classes) {
      // دروس این پایه و رشته
      const darsList = await prisma.darsPayeReshteh.findMany({
        where: {
          payeId: klass.payeId,
          reshtehTahsiliId: klass.reshtehTahsiliId,
        },
        include: {
          reshtehTadris: { select: { id: true, title: true } },
        },
        orderBy: { reshtehTadris: { title: "asc" } },
      });

      // تخصیص‌های موجود (معلم‌ها) برای این کلاس
      const existingCourses = await prisma.classCourse.findMany({
        where: { klassId: klass.id },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nationalCode: true,
            },
          },
        },
      });

      // map برای دسترسی سریع
      const courseMap = new Map(
        existingCourses.map((c) => [c.darsPayeReshtehId, c]),
      );

      // ۳. برای هر درس یک ردیف بساز
      for (const dars of darsList) {
        const existing = courseMap.get(dars.id);

        allItems.push({
          // شناسه یکتا برای کلید React
          id: `${klass.id}-${dars.id}`,
          klassId: klass.id,
          klassTitle: klass.title,
          payeId: klass.paye.id,
          payeTitle: klass.paye.title,
          reshtehTahsiliTitle: klass.reshtehTahsili.title,
          darsPayeReshtehId: dars.id,
          lessonTitle: dars.reshtehTadris.title,
          units: dars.units,
          // معلم (اگر تخصیص یافته)
          classCourseId: existing?.id ?? null,
          teacherId: existing?.teacherId ?? null,
          teacher: existing?.teacher ?? null,
        });
      }
    }

    // ۴. جستجوی متنی روی آیتم‌های ترکیبی
    let filteredItems = allItems;

    if (searchField && searchValue?.trim()) {
      const val = searchValue.trim().toLowerCase();

      if (searchField === "lesson") {
        filteredItems = filteredItems.filter((item) =>
          item.lessonTitle.toLowerCase().includes(val),
        );
      } else if (searchField === "teacher") {
        filteredItems = filteredItems.filter((item) => {
          if (!item.teacher) return false;
          const fullName =
            `${item.teacher.firstName} ${item.teacher.lastName}`.toLowerCase();
          return fullName.includes(val);
        });
      }
    }

    // ۵. مرتب‌سازی نهایی
    if (sortField === "lesson") {
      filteredItems.sort((a, b) => {
        const cmp = a.lessonTitle.localeCompare(b.lessonTitle, "fa");
        return sortOrder === "asc" ? cmp : -cmp;
      });
    } else if (sortField === "teacher") {
      filteredItems.sort((a, b) => {
        const aName = a.teacher
          ? `${a.teacher.firstName} ${a.teacher.lastName}`
          : "";
        const bName = b.teacher
          ? `${b.teacher.firstName} ${b.teacher.lastName}`
          : "";
        const cmp = aName.localeCompare(bName, "fa");
        return sortOrder === "asc" ? cmp : -cmp;
      });
    }

    // ۶. صفحه‌بندی
    const total = filteredItems.length;
    const items = filteredItems.slice(skip, skip + pageSize);

    return { items, total };
  } catch (err) {
    console.error("getClassCoursesWithJoin error:", err);
    return { items: [], total: 0 };
  }
}

// ==========================================
// ۲. تخصیص معلم به درس کلاس (upsert)
// ==========================================
const assignTeacherSchema = z.object({
  klassId: z.string().min(1, "کلاس الزامی است"),
  darsPayeReshtehId: z.string().min(1, "درس الزامی است"),
  teacherId: z.string().min(1, "معلم را انتخاب کنید"),
});

export async function assignTeacherToClassCourse(input: unknown) {
  const parsed = assignTeacherSchema.safeParse(input);
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
    // ۱. بررسی کلاس
    const klass = await prisma.klass.findFirst({
      where: {
        id: parsed.data.klassId,
        schoolId: context.schoolId,
        academicYearId: context.academicYearId,
      },
    });
    if (!klass) return error("کلاس یافت نشد");

    // ۲. بررسی درس
    const dars = await prisma.darsPayeReshteh.findUnique({
      where: { id: parsed.data.darsPayeReshtehId },
    });
    if (!dars) return error("درس یافت نشد");

    // ۳. بررسی معلم
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: parsed.data.teacherId,
        assignments: {
          some: {
            schoolId: context.schoolId,
            academicYearId: context.academicYearId,
            isActive: true,
          },
        },
      },
    });
    if (!teacher) return error("معلم یافت نشد یا به این مدرسه تخصیص نیافته");

    // ۴. upsert
    const result = await prisma.classCourse.upsert({
      where: {
        klassId_darsPayeReshtehId: {
          klassId: parsed.data.klassId,
          darsPayeReshtehId: parsed.data.darsPayeReshtehId,
        },
      },
      update: {
        teacherId: parsed.data.teacherId,
        lastEditedByUsername: username,
      },
      create: {
        klassId: parsed.data.klassId,
        darsPayeReshtehId: parsed.data.darsPayeReshtehId,
        teacherId: parsed.data.teacherId,
        lastEditedByUsername: username,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nationalCode: true,
          },
        },
      },
    });

    revalidatePath(CLASS_COURSES_ROUTE);
    return success(result);
  } catch (err) {
    console.error(err);
    return error("خطا در تخصیص معلم");
  }
}

// ==========================================
// ۳. حذف معلم (فقط teacherId را null می‌کنیم)
// ==========================================
export async function removeTeacherFromClassCourse(
  klassId: string,
  darsPayeReshtehId: string,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("ابتدا وارد حساب کاربری شوید");

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return error("کانتکست فعال یافت نشد");
  }

  try {
    // بررسی وجود ClassCourse
    const existing = await prisma.classCourse.findFirst({
      where: {
        klassId,
        darsPayeReshtehId,
        klass: {
          schoolId: context.schoolId,
          academicYearId: context.academicYearId,
        },
      },
    });

    if (existing) {
      await prisma.classCourse.update({
        where: { id: existing.id },
        data: { teacherId: null },
      });
    }

    revalidatePath(CLASS_COURSES_ROUTE);
    return success({ id: klassId });
  } catch (err) {
    console.error(err);
    return error("خطا در حذف معلم");
  }
}
// ==========================================
// دریافت لیست معلمان مدرسه (برای مودال انتخاب معلم)
// ==========================================
export async function getSchoolTeachers() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return error("ابتدا وارد حساب کاربری شوید");
  }

  const context = await getCurrentContext();
  if (!context?.schoolId || !context.academicYearId) {
    return error("کانتکست فعال یافت نشد");
  }

  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        assignments: {
          some: {
            schoolId: context.schoolId,
            academicYearId: context.academicYearId,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationalCode: true,
        personnelCode: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return success(teachers);
  } catch (err) {
    console.error("getSchoolTeachers error:", err);
    return error("خطا در دریافت معلمان");
  }
}
