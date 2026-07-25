import { PrismaClient, Role } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const email = "master@lms.local";
  const password = "12345678";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Master",
        firstName: "Master",
        lastName: "Admin",
      },
    });
  }

  await prisma.user.update({
    where: { email },
    data: {
      role: Role.MASTER,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("Master user is ready:", { email, password });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
