import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

var _a;
const connectionString = (_a = process.env.DATABASE_URL) == null ? void 0 : _a.replace("mysql://", "mariadb://");
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

export { prisma as p };
//# sourceMappingURL=prisma.mjs.map
