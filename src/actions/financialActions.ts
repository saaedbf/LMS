"use server";

import { prisma } from "@/lib/prisma";
import { getScope } from "@/lib/auth-helpers";
import { isScopeError } from "@/lib/auth-helpers-utils";
import { PERMISSIONS } from "@/lib/permissions";
import {
  createDebtSchema,
  CreateDebtSchema,
  createPaymentSchema,
  CreatePaymentSchema,
  updateFinancialTransactionSchema,
  UpdateFinancialTransactionSchema,
  deleteFinancialTransactionSchema,
  DeleteFinancialTransactionSchema,
} from "@/lib/schemas/financialSchemas";
import { ActionResult } from "@/types/index";
import { ListOptions } from "@/types/myTypes";
import { revalidatePath } from "next/cache";
import { parseJalaliDate } from "@/lib/dateUtils";
import { DebtType, PaymentMethod, TransactionType } from "@prisma/client";

const FINANCIAL_ROUTE = "/dashboard/manager/financial";

export type FinancialListItem = {
  id: string;
  type: TransactionType; // ⬅️ به جای "DEBT" | "PAYMENT"
  amount: bigint;
  debtType: DebtType | null; // ⬅️ به جای string | null
  paymentMethod: PaymentMethod | null; // ⬅️ به جای string | null
  date: Date;
  description: string | null;
  studentEnrollment: {
    student: { id: string; firstName: string; lastName: string };
    paye: { id: number; title: string } | null;
    klass: { id: string; title: string } | null;
  };
};

// ==========================================
// ۱. دریافت لیست تراکنش‌ها
// ==========================================
export async function getFinancialTransactions(
  page: number,
  pageSize: number,
  options?: ListOptions,
): Promise<{ items: FinancialListItem[]; total: number }> {
  const scope = await getScope(PERMISSIONS.MANAGE_FINANCIAL);
  if (isScopeError(scope)) return { items: [], total: 0 };

  const { schoolId, academicYearId } = scope;

  const {
    sortField = "date",
    sortOrder = "desc",
    searchField,
    searchValue,
  } = options ?? {};

  const skip = (page - 1) * pageSize;

  const where: any = {
    studentEnrollment: {
      schoolId,
      academicYearId,
    },
  };

  if (searchField && searchValue?.trim()) {
    const val = searchValue.trim();

    switch (searchField) {
      case "studentName":
        where.studentEnrollment.student = {
          OR: [
            { firstName: { contains: val, mode: "insensitive" } },
            { lastName: { contains: val, mode: "insensitive" } },
          ],
        };
        break;
      case "paye":
        where.studentEnrollment.paye = {
          title: { contains: val, mode: "insensitive" },
        };
        break;
      case "klass":
        where.studentEnrollment.klass = {
          title: { contains: val, mode: "insensitive" },
        };
        break;
      case "description":
        where.description = { contains: val, mode: "insensitive" };
        break;
      case "date": {
        const jalaliDate = parseJalaliDate(val);
        if (jalaliDate) {
          const startOfDay = new Date(jalaliDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(jalaliDate);
          endOfDay.setHours(23, 59, 59, 999);
          where.date = { gte: startOfDay, lte: endOfDay };
        }
        break;
      }
    }
  }

  let orderBy: any = { date: sortOrder };

  switch (sortField) {
    case "studentName":
      orderBy = { studentEnrollment: { student: { firstName: sortOrder } } };
      break;
    case "amount":
      orderBy = { amount: sortOrder };
      break;
    case "date":
      orderBy = { date: sortOrder };
      break;
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.financialTransaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          studentEnrollment: {
            include: {
              student: {
                select: { id: true, firstName: true, lastName: true },
              },
              paye: { select: { id: true, title: true } },
              klass: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.financialTransaction.count({ where }),
    ]);

    return { items: items as FinancialListItem[], total };
  } catch (error) {
    console.error("getFinancialTransactions error:", error);
    return { items: [], total: 0 };
  }
}

// ==========================================
// ۲. ایجاد بدهکاری (گروهی)
// ==========================================
export async function createDebtsAction(
  data: CreateDebtSchema,
): Promise<ActionResult<{ created: number; skipped: number }>> {
  try {
    const parsed = createDebtSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getScope(PERMISSIONS.MANAGE_FINANCIAL);
    if (isScopeError(scope)) {
      return { status: "error", error: scope.error };
    }

    const { schoolId, academicYearId, username } = scope;
    const { enrollmentIds, debtType, date, description, amount } = parsed.data;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { status: "error", error: "تاریخ نامعتبر است" };
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        id: { in: enrollmentIds },
        schoolId,
        academicYearId,
      },
      select: { id: true },
    });

    if (enrollments.length === 0) {
      return { status: "error", error: "دانش‌آموزی یافت نشد" };
    }

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;

      for (const e of enrollments) {
        await tx.financialTransaction.create({
          data: {
            studentEnrollmentId: e.id,
            type: "DEBT",
            amount: BigInt(amount),
            debtType,
            date: parsedDate,
            description: description || null,
            lastEditedByUsername: username,
          },
        });
        created++;
      }

      return { created, skipped: enrollmentIds.length - created };
    });

    revalidatePath(FINANCIAL_ROUTE);
    return { status: "success", data: result };
  } catch (error) {
    console.error("createDebtsAction error:", error);
    return { status: "error", error: "خطا در ثبت بدهکاری" };
  }
}

// ==========================================
// ۳. ایجاد پرداخت (گروهی)
// ==========================================
export async function createPaymentsAction(
  data: CreatePaymentSchema,
): Promise<ActionResult<{ created: number; skipped: number }>> {
  try {
    const parsed = createPaymentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getScope(PERMISSIONS.MANAGE_FINANCIAL);
    if (isScopeError(scope)) {
      return { status: "error", error: scope.error };
    }

    const { schoolId, academicYearId, username } = scope;
    const { enrollmentIds, paymentMethod, date, description, amount } =
      parsed.data;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return { status: "error", error: "تاریخ نامعتبر است" };
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        id: { in: enrollmentIds },
        schoolId,
        academicYearId,
      },
      select: { id: true },
    });

    if (enrollments.length === 0) {
      return { status: "error", error: "دانش‌آموزی یافت نشد" };
    }

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;

      for (const e of enrollments) {
        await tx.financialTransaction.create({
          data: {
            studentEnrollmentId: e.id,
            type: "PAYMENT",
            amount: BigInt(amount),
            paymentMethod,
            date: parsedDate,
            description: description || null,
            lastEditedByUsername: username,
          },
        });
        created++;
      }

      return { created, skipped: enrollmentIds.length - created };
    });

    revalidatePath(FINANCIAL_ROUTE);
    return { status: "success", data: result };
  } catch (error) {
    console.error("createPaymentsAction error:", error);
    return { status: "error", error: "خطا در ثبت پرداخت" };
  }
}

// ==========================================
// ۴. ویرایش تراکنش
// ==========================================
export async function updateFinancialTransactionAction(
  data: UpdateFinancialTransactionSchema,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = updateFinancialTransactionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getScope(PERMISSIONS.MANAGE_FINANCIAL);
    if (isScopeError(scope)) {
      return { status: "error", error: scope.error };
    }

    const transaction = await prisma.financialTransaction.findFirst({
      where: {
        id: parsed.data.id,
        studentEnrollment: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
        },
      },
    });

    if (!transaction) {
      return { status: "error", error: "تراکنش یافت نشد" };
    }

    const parsedDate = new Date(parsed.data.date);
    if (isNaN(parsedDate.getTime())) {
      return { status: "error", error: "تاریخ نامعتبر است" };
    }

    const updateData: any = {
      amount: BigInt(parsed.data.amount),
      date: parsedDate,
      description: parsed.data.description || null,
      lastEditedByUsername: scope.username,
    };

    if (transaction.type === "DEBT" && parsed.data.debtType) {
      updateData.debtType = parsed.data.debtType;
    }

    if (transaction.type === "PAYMENT" && parsed.data.paymentMethod) {
      updateData.paymentMethod = parsed.data.paymentMethod;
    }

    await prisma.financialTransaction.update({
      where: { id: transaction.id },
      data: updateData,
    });

    revalidatePath(FINANCIAL_ROUTE);
    return { status: "success", data: { id: transaction.id } };
  } catch (error) {
    console.error("updateFinancialTransactionAction error:", error);
    return { status: "error", error: "خطا در ویرایش تراکنش" };
  }
}

// ==========================================
// ۵. حذف تراکنش
// ==========================================
export async function deleteFinancialTransactionAction(
  data: DeleteFinancialTransactionSchema,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = deleteFinancialTransactionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.issues[0]?.message || "داده‌های ورودی نامعتبر است",
      };
    }

    const scope = await getScope(PERMISSIONS.MANAGE_FINANCIAL);
    if (isScopeError(scope)) {
      return { status: "error", error: scope.error };
    }

    const transaction = await prisma.financialTransaction.findFirst({
      where: {
        id: parsed.data.id,
        studentEnrollment: {
          schoolId: scope.schoolId,
          academicYearId: scope.academicYearId,
        },
      },
      select: { id: true },
    });

    if (!transaction) {
      return { status: "error", error: "تراکنش یافت نشد" };
    }

    await prisma.financialTransaction.delete({ where: { id: transaction.id } });

    revalidatePath(FINANCIAL_ROUTE);
    return { status: "success", data: { id: transaction.id } };
  } catch (error) {
    console.error("deleteFinancialTransactionAction error:", error);
    return { status: "error", error: "خطا در حذف تراکنش" };
  }
}

// ==========================================
// ۶. دریافت لیست دانش‌آموزان برای انتخاب
// ==========================================
export async function getStudentsForFinancial(filters: {
  payeId?: number;
  klassId?: string;
}): Promise<ActionResult<any[]>> {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_FINANCIAL);
    if (isScopeError(scope)) {
      return { status: "error", error: scope.error };
    }

    const rows = await prisma.studentEnrollment.findMany({
      where: {
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
        ...(filters.payeId ? { payeId: filters.payeId } : {}),
        ...(filters.klassId ? { klassId: filters.klassId } : {}),
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        paye: { select: { title: true } },
        klass: { select: { title: true } },
      },
      orderBy: { student: { firstName: "asc" } },
    });

    return {
      status: "success",
      data: rows.map((r) => ({
        enrollmentId: r.id,
        fullName: `${r.student.firstName} ${r.student.lastName}`,
        klassTitle: r.klass?.title || "",
        payeTitle: r.paye?.title || "",
      })),
    };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "خطا در دریافت دانش‌آموزان" };
  }
}

// ==========================================
// ۷. دریافت گزینه‌های فیلتر (پایه و کلاس)
// ==========================================
export async function getFinancialFilterOptions(): Promise<{
  status: "success" | "error";
  payes?: { id: number; title: string }[];
  klasses?: { id: string; title: string; payeId: number }[];
}> {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_FINANCIAL);
    if (isScopeError(scope)) return { status: "error" };

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
      },
      select: {
        paye: { select: { id: true, title: true } },
        klass: { select: { id: true, title: true, payeId: true } },
      },
    });

    const payeMap = new Map<number, { id: number; title: string }>();
    const klassMap = new Map<
      string,
      { id: string; title: string; payeId: number }
    >();

    for (const e of enrollments) {
      if (e.paye) payeMap.set(e.paye.id, e.paye);
      if (e.klass) klassMap.set(e.klass.id, e.klass);
    }

    return {
      status: "success",
      payes: [...payeMap.values()].sort((a, b) => a.id - b.id),
      klasses: [...klassMap.values()].sort((a, b) =>
        a.title.localeCompare(b.title, "fa"),
      ),
    };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}
// ==========================================
// ۸. دریافت وضعیت مالی یک دانش‌آموز
// ==========================================
export type StudentFinancialSummary = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    nationalCode: string;
  };
  enrollmentId: string;
  transactions: Array<{
    id: string;
    type: "DEBT" | "PAYMENT";
    amount: number;
    debtType: string | null;
    paymentMethod: string | null;
    date: Date;
    description: string | null;
  }>;
  totalDebt: number;
  totalPayment: number;
  balance: number; // مثبت = بدهکار، منفی = بستانکار
};

export async function getStudentFinancialSummary(
  enrollmentId: string,
): Promise<ActionResult<StudentFinancialSummary>> {
  try {
    const scope = await getScope(PERMISSIONS.MANAGE_FINANCIAL);
    if (isScopeError(scope)) {
      return { status: "error", error: scope.error };
    }

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        id: enrollmentId,
        schoolId: scope.schoolId,
        academicYearId: scope.academicYearId,
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
        financialTransactions: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!enrollment) {
      return { status: "error", error: "دانش‌آموز یافت نشد" };
    }

    const transactions = enrollment.financialTransactions.map((t) => ({
      id: t.id,
      type: t.type as "DEBT" | "PAYMENT",
      amount: Number(t.amount),
      debtType: t.debtType,
      paymentMethod: t.paymentMethod,
      date: t.date,
      description: t.description,
    }));

    const totalDebt = transactions
      .filter((t) => t.type === "DEBT")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayment = transactions
      .filter((t) => t.type === "PAYMENT")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalDebt - totalPayment;

    return {
      status: "success",
      data: {
        student: enrollment.student,
        enrollmentId: enrollment.id,
        transactions,
        totalDebt,
        totalPayment,
        balance,
      },
    };
  } catch (error) {
    console.error("getStudentFinancialSummary error:", error);
    return { status: "error", error: "خطا در دریافت وضعیت مالی" };
  }
}
