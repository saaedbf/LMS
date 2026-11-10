import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import path from "path";
import fs from "fs/promises";
import { TeacherGradesPdf } from "@/lib/pdf/TeacherGradesPdf";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get("periodId");
    const klassId = searchParams.get("klassId");
    const lessonId = searchParams.get("lessonId");

    if (!periodId || !klassId || !lessonId) {
      return new NextResponse("پارامترها ناقص هستند", { status: 400 });
    }

    // دریافت اطلاعات کلاس و درس
    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: { gradePeriodId: periodId, klassId, darsPayeReshtehId: lessonId },
      include: {
        gradePeriod: true,
        klass: {
          include: {
            paye: true,
            reshtehTahsili: true,
            school: true,
            academicYear: true,
          },
        },
        darsPayeReshteh: { include: { reshtehTadris: true } },
      },
    });

    if (!gradePeriodLesson) {
      return new NextResponse("درس یافت نشد", { status: 404 });
    }

    // دریافت دانش‌آموزان و نمرات
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { klassId },
      include: { student: true },
      orderBy: [{ student: { lastName: "asc" } }],
    });

    const grades = await prisma.grade.findMany({
      where: { gradePeriodLessonId: gradePeriodLesson.id },
    });

    const gradesMap = new Map(grades.map((g) => [g.studentEnrollmentId, g]));

    const studentsData = enrollments.map((e) => {
      const grade = gradesMap.get(e.id);
      return {
        fullName: `${e.student.firstName} ${e.student.lastName}`,
        nationalCode: e.student.nationalCode,
        score: grade?.score ?? null,
        correctCount: grade?.correctCount ?? null,
        wrongCount: grade?.wrongCount ?? null,
        blankCount: grade?.blankCount ?? null,
      };
    });

    // خواندن فونت
    const fontDir = path.join(
      process.cwd(),
      "public",
      "fonts",
      "iransans-fanum",
      "ttf",
    );
    const regularFontBuffer = await fs.readFile(
      path.join(fontDir, "IRANSansWeb(FaNum).ttf"),
    );
    const boldFontBuffer = await fs.readFile(
      path.join(fontDir, "IRANSansWeb(FaNum)_Bold.ttf"),
    );
    const regularFont = `data:font/ttf;base64,${regularFontBuffer.toString("base64")}`;
    const boldFont = `data:font/ttf;base64,${boldFontBuffer.toString("base64")}`;

    const isTest = gradePeriodLesson.gradePeriod.examType === "TEST";

    const pdfBuffer = await renderToBuffer(
      TeacherGradesPdf({
        data: {
          schoolTitle: gradePeriodLesson.klass.school.title,
          yearTitle: gradePeriodLesson.klass.academicYear.title,
          periodTitle: gradePeriodLesson.gradePeriod.title,
          klassTitle: gradePeriodLesson.klass.title,
          payeTitle: gradePeriodLesson.klass.paye.title,
          reshtehTitle: gradePeriodLesson.klass.reshtehTahsili.title,
          lessonTitle: gradePeriodLesson.darsPayeReshteh.reshtehTadris.title,
          isTest,
          students: studentsData,
        },
        regularFont,
        boldFont,
      }),
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="grades-${klassId}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("خطا در ساخت PDF", { status: 500 });
  }
}
