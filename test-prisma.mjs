import { PrismaClient } from './prisma/generated/prisma/index.js';

async function main() {
  try {
    const prisma = new PrismaClient();
    console.log("Prisma client created");
    const users = await prisma.user.findMany();
    console.log("Success:", users.length);
  } catch (e) {
    console.error("Error connecting/querying:", e.message);
  }
}
main();
