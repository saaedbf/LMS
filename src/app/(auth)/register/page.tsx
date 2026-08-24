import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RegisterForm from "./_components/register-form";

export default async function RegisterPage() {
  const isEnabled =
    process.env.ENABLE_DEV_REGISTER === "true" &&
    process.env.NODE_ENV !== "production";

  if (!isEnabled) {
    notFound();
  }

  const [schools, academicYears] = await Promise.all([
    prisma.school.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        title: "asc",
      },
      select: {
        id: true,
        title: true,
      },
    }),
    prisma.academicYear.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        isActive: true,
      },
    }),
  ]);

  return (
    <div className="container max-w-2xl py-10">
      <RegisterForm schools={schools} academicYears={academicYears} />
    </div>
  );
}
