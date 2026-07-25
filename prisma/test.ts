import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: "master@lms.local",
    },
  });

  console.log(user?.password);

  console.log(await bcrypt.compare("123456", user!.password));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
