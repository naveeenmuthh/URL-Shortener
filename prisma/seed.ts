import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  console.log("-------------Seeders Executed!!");

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
