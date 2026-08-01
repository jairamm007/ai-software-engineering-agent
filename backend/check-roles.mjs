import { prisma } from "./src/database/prisma.js";
const users = await prisma.user.findMany({ select: { email: true, role: true, name: true, emailVerified: true, suspended: true } });
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
