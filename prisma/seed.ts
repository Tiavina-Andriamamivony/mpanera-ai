import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const categories = [
  { name: "Plomberie", slug: "plomberie", icon: "Wrench" },
  { name: "Électricité", slug: "electricite", icon: "Zap" },
  { name: "Couture", slug: "couture", icon: "Scissors" },
  { name: "Ménage", slug: "menage", icon: "SprayCan" },
  {
    name: "Cours particuliers",
    slug: "cours-particuliers",
    icon: "GraduationCap",
  },
  { name: "Traiteur", slug: "traiteur", icon: "ChefHat" },
]

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    })
  }
  console.log(`Seeded ${categories.length} categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
