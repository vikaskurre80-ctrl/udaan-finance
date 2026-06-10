import { PrismaClient } from './prisma/generated/prisma';

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    console.log("Success:", users.length);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
