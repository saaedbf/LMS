import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get("periodId");
    const klassId = searchParams.get("klassId");
    const lessonId = searchParams.get("lessonId");

    if (!periodId || !klassId || !lessonId) {
      return NextResponse.json(
        { error: "پارامترها ناقص هستند" },
        { status: 400 },
      );
    }

    const gradePeriodLesson = await prisma.gradePeriodLesson.findFirst({
      where: {
        gradePeriodId: periodId,
        klassId,
        darsPayeReshtehId: lessonId,
      },
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
      return NextResponse.json({ error: "درس یافت نشد" }, { status: 404 });
    }

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

    const isTest = gradePeriodLesson.gradePeriod.examType === "TEST";

    return NextResponse.json({
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
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "خطا در دریافت داده" },
      { status: 500 },
    );
  }
}
