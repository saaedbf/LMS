"use server";
import { prisma } from "@/lib/prisma";
import { RegionSchema } from "@/lib/schemas/regionSchemas";
import { ActionResult } from "@/types/index";
import { Region } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  getTableData,
  Column,
} from "@/components/widgets/Elements/table/table-utils2";
import { ListOptions } from "@/types/myTypes";

// ✅ ایجاد Region جدید با id از ورودی
export async function CreateRegionAction(
  data: RegionSchema,
): Promise<ActionResult<Region>> {
  try {
    const { id, title, ostanId } = data;

    // بررسی تکراری نبودن id
    const existingId = await prisma.region.findUnique({
      where: { id },
    });
    if (existingId) {
      return { status: "error", error: "کد منطقه تکراری است" };
    }

    // بررسی وجود استان
    const ostan = await prisma.ostan.findUnique({
      where: { id: ostanId },
    });
    if (!ostan) {
      return { status: "error", error: "استان انتخاب شده وجود ندارد" };
    }

    // بررسی تکراری نبودن نام منطقه در همان استان
    const existingTitle = await prisma.region.findFirst({
      where: {
        title,
        ostanId,
      },
    });
    if (existingTitle) {
      return {
        status: "error",
        error: "این منطقه قبلاً برای این استان ثبت شده است",
      };
    }

    const result = await prisma.region.create({
      data: {
        id, // ← id از ورودی
        title,
        ostanId,
      },
      include: {
        ostan: true,
      },
    });

    revalidatePath("/dashboard/manager/region");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "خطا در عملیات ثبت منطقه" };
  }
}

// ✅ ویرایش Region
export async function updateRegionAction(
  data: RegionSchema,
): Promise<ActionResult<Region>> {
  try {
    const { id, title, ostanId } = data;

    if (!id) {
      return { status: "error", error: "کد منطقه الزامی است" };
    }

    // بررسی وجود منطقه
    const existing = await prisma.region.findUnique({
      where: { id },
    });
    if (!existing) {
      return { status: "error", error: "منطقه مورد نظر وجود ندارد" };
    }

    // بررسی وجود استان
    const ostan = await prisma.ostan.findUnique({
      where: { id: ostanId },
    });
    if (!ostan) {
      return { status: "error", error: "استان انتخاب شده وجود ندارد" };
    }

    // بررسی تکراری نبودن نام منطقه در همان استان (به جز خودش)
    const duplicate = await prisma.region.findFirst({
      where: {
        title,
        ostanId,
        NOT: { id },
      },
    });
    if (duplicate) {
      return {
        status: "error",
        error: "این منطقه قبلاً برای این استان ثبت شده است",
      };
    }

    const result = await prisma.region.update({
      where: { id },
      data: {
        title,
        ostanId,
      },
      include: {
        ostan: true,
      },
    });

    revalidatePath("/dashboard/manager/region");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "خطا در عملیات ویرایش منطقه" };
  }
}

// ✅ حذف Region
export async function DeleteRegionAction(
  id: number,
): Promise<ActionResult<Region>> {
  try {
    const existing = await prisma.region.findUnique({
      where: { id },
    });
    if (!existing) {
      return { status: "error", error: "منطقه مورد نظر وجود ندارد" };
    }

    const result = await prisma.region.delete({
      where: { id },
    });

    revalidatePath("/dashboard/manager/region");
    return { status: "success", data: result };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "خطا در عملیات حذف منطقه" };
  }
}
// actions/regionActions.ts
// ✅ ساده‌ترین و بدون خطا

// ✅ دریافت لیست همه استان‌ها برای Select
export async function getAllOstans() {
  try {
    const ostans = await prisma.ostan.findMany({
      orderBy: {
        title: "asc",
      },
    });
    return { status: "success", data: ostans };
  } catch (error) {
    console.error("Error:", error); // ✅ استفاده از error
    return { status: "error", error: "خطا در دریافت لیست استان‌ها" };
  }
}
// actions/regionActions.ts

// ========== تعریف ستون‌ها ==========

// ✅ تعریف ستون‌ها
const columns: Column[] = [
  { field: "id", type: "number", searchable: true, sortable: true },
  { field: "title", type: "string", searchable: true, sortable: true },
  { field: "ostanId", type: "number", searchable: true, sortable: true },
  {
    field: "ostanTitle",
    type: "string",
    searchable: true,
    sortable: true,
    relation: {
      model: "ostan",
      field: "title",
    },
  },
];

// ✅ تابع getRegions با استفاده از تابع عمومی
export async function getRegions(
  page: number,
  pageSize: number,
  options: ListOptions,
): Promise<{ items: Region[]; total: number }> {
  return getTableData<Region>(prisma.region, columns, page, pageSize, options);
}

// actions/regionActions.ts
export async function getRegionsWithDetails(
  page: number,
  pageSize: number,
  options: ListOptions,
) {
  return getTableData<Region>(prisma.region, columns, page, pageSize, {
    ...options,
    extraInclude: {
      ostan: {
        include: {
          regions: {
            include: {
              districts: true,
            },
          },
        },
      },
    },
  });
}
// actions/studentActions.ts
// const columns: Column[] = [
//   { field: 'id', type: 'number', searchable: true, sortable: true },
//   { field: 'firstName', type: 'string', searchable: true, sortable: true },
//   { field: 'lastName', type: 'string', searchable: true, sortable: true },
//   {
//     field: 'className',
//     type: 'string',
//     searchable: true,
//     sortable: true,
//     relation: {
//       model: 'class',
//       field: 'title',
//       include: {
//         teacher: true,    // ✅ معلم کلاس
//         students: {       // ✅ دانش‌آموزان کلاس (با محدودیت)
//           include: {
//             parent: true  // ✅ والدین دانش‌آموز
//           }
//         }
//       }
//     }
//   },
// ];

// خروجی include:
// {
//   class: {
//     include: {
//       teacher: true,
//       students: {
//         include: {
//           parent: true
//         }
//       }
//     }
//   }
// }
