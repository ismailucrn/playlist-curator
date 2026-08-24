import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

const categories = [
  {
    id: "cat-turkish",
    name: "Türkçe",
    slug: "turkce",
    type: "language",
    description: "Türkçe sözlü parçalar",
    rules: [
      { field: "title", operator: "contains", value: "gece", weight: 0.55 },
      { field: "title", operator: "contains", value: "şarkı", weight: 0.7 },
    ],
  },
  {
    id: "cat-english",
    name: "İngilizce",
    slug: "ingilizce",
    type: "language",
    description: "İngilizce sözlü parçalar",
    rules: [
      { field: "title", operator: "contains", value: "midnight", weight: 0.8 },
      { field: "title", operator: "contains", value: "run", weight: 0.65 },
    ],
  },
  {
    id: "cat-electronic",
    name: "Elektronik",
    slug: "elektronik",
    type: "genre",
    description: "Elektronik ve synth ağırlıklı parçalar",
    rules: [
      { field: "title", operator: "contains", value: "electric", weight: 0.9 },
      { field: "artist", operator: "contains", value: "voltage", weight: 0.8 },
      { field: "artist", operator: "contains", value: "metric", weight: 0.75 },
    ],
  },
  {
    id: "cat-night-drive",
    name: "Gece Sürüşü",
    slug: "gece-surusu",
    type: "mood",
    description: "Gece sürüşlerinde akıp giden parçalar",
    rules: [
      { field: "title", operator: "contains", value: "night", weight: 0.85 },
      { field: "title", operator: "contains", value: "gece", weight: 0.85 },
      { field: "album", operator: "contains", value: "neon", weight: 0.75 },
    ],
  },
  {
    id: "cat-workout",
    name: "Spor",
    slug: "spor",
    type: "mood",
    description: "Tempo ve hareket için yüksek enerjili parçalar",
    rules: [
      { field: "title", operator: "contains", value: "koş", weight: 0.95 },
      { field: "title", operator: "contains", value: "run", weight: 0.85 },
      { field: "album", operator: "contains", value: "momentum", weight: 0.8 },
    ],
  },
  {
    id: "cat-calm",
    name: "Sakin",
    slug: "sakin",
    type: "mood",
    description: "Dinlenmek ve yavaşlamak için",
    rules: [
      { field: "title", operator: "contains", value: "calma", weight: 0.95 },
      { field: "title", operator: "contains", value: "yavaş", weight: 0.9 },
      { field: "artist", operator: "contains", value: "soft", weight: 0.8 },
    ],
  },
] as const;

async function main() {
  await prisma.user.upsert({
    where: { id: "demo-user" },
    update: {},
    create: {
      id: "demo-user",
      mode: "demo",
      displayName: "Demo Kullanıcı",
      activeProvider: "demo",
    },
  });

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { userId_slug: { userId: "demo-user", slug: category.slug } },
      update: {},
      create: {
        id: category.id,
        userId: "demo-user",
        name: category.name,
        slug: category.slug,
        type: category.type,
        description: category.description,
      },
      include: { rules: true },
    });

    if (saved.rules.length === 0) {
      await prisma.categoryRule.createMany({
        data: category.rules.map((rule) => ({ ...rule, categoryId: saved.id })),
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Demo seed failed:", error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
