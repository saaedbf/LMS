import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SchoolRole, SystemRole } from "@prisma/client";
import { registerSchema } from "@/lib/schemas/register.schema";

export async function POST(req: Request) {
  try {
    const enabled =
      process.env.ENABLE_DEV_REGISTER === "true" &&
      process.env.NODE_ENV !== "production";

    if (!enabled) {
      return NextResponse.json({ message: "غیرفعال" }, { status: 403 });
    }

    const json = await req.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "اطلاعات نامعتبر است",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const email = data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "کاربری با این ایمیل وجود دارد" },
        { status: 409 },
      );
    }

    const fullName = `${data.firstName} ${data.lastName}`.trim();

    await auth.api.signUpEmail({
      body: {
        email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        // فقط اگر Better Auth شما این فیلد را می‌پذیرد نگهش دار
        name: fullName,
      },
    });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "کاربر ساخته شد اما یافت نشد" },
        { status: 500 },
      );
    }

    if (data.makeMaster) {
      await prisma.user.update({
        where: { id: user.id },
        data: { systemRole: SystemRole.MASTER },
      });
    }

    if (data.schoolId && data.academicYearId && data.schoolRole) {
      const [school, academicYear] = await Promise.all([
        prisma.school.findUnique({
          where: { id: data.schoolId },
          select: { id: true },
        }),
        prisma.academicYear.findUnique({
          where: { id: data.academicYearId },
          select: { id: true },
        }),
      ]);

      if (!school || !academicYear) {
        return NextResponse.json(
          { message: "مدرسه یا سال تحصیلی معتبر نیست" },
          { status: 400 },
        );
      }

      await prisma.userAssignment.upsert({
        where: {
          userId_schoolId_academicYearId_role: {
            userId: user.id,
            schoolId: data.schoolId,
            academicYearId: data.academicYearId,
            role: data.schoolRole as SchoolRole,
          },
        },
        update: {},
        create: {
          userId: user.id,
          schoolId: data.schoolId,
          academicYearId: data.academicYearId,
          role: data.schoolRole as SchoolRole,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DEV_REGISTER_ERROR", error);
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
