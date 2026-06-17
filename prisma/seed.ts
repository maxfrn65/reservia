import { PrismaClient, Role } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

async function main() {
  console.log("Cleaning existing data...");
  await prisma.reservation.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.image.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");
  const [admin, user] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@reservia.test",
        name: "Admin Reservia",
        password: await bcrypt.hash("admin1234", 10),
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: "user@reservia.test",
        name: "Test User",
        password: await bcrypt.hash("user1234", 10),
        role: Role.USER,
      },
    }),
  ]);

  console.log("Seeding destinations...");
  const today = new Date();
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const destinations = [
    {
      name: "Bali",
      country: "Indonesia",
      basePrice: 1290,
      shortDescription: "Rizières, temples et spa au cœur d'Ubud.",
      description:
        "Une escapade de rêve à Bali, entre rizières en terrasses, temples millénaires et instants de bien-être au spa. Hébergement en villa avec piscine privée, transferts aéroport et petit-déjeuner inclus.",
      images: [
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200",
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200",
      ],
    },
    {
      name: "Kyoto",
      country: "Japan",
      basePrice: 1890,
      shortDescription: "La saison des cerisiers en fleurs à Kyoto.",
      description:
        "Vivez le hanami à Kyoto : promenades dans les jardins zen, visite des temples du Kinkaku-ji et du Fushimi Inari, dîners kaiseki traditionnels.",
      images: [
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200",
        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200",
      ],
    },
    {
      name: "Santorini",
      country: "Greece",
      basePrice: 1450,
      shortDescription: "Cyclades, couchers de soleil sur la caldeira.",
      description:
        "Découvrez Oia et Fira, leurs maisons blanches accrochées à la falaise et les couchers de soleil les plus iconiques de la mer Égée. Croisière catamaran incluse.",
      images: [
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200",
        "https://images.unsplash.com/photo-1503152394-c571994fd383?w=1200",
      ],
    },
    {
      name: "Marrakech",
      country: "Morocco",
      basePrice: 690,
      shortDescription: "Souks, riads et excursion dans l'Atlas.",
      description:
        "Séjour en riad au cœur de la médina, hammam traditionnel, dégustations culinaires et excursion d'une journée dans les montagnes de l'Atlas.",
      images: [
        "https://images.unsplash.com/photo-1551522435-a13afa10f103?w=1200",
        "https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=1200",
      ],
    },
    {
      name: "Torres del Paine",
      country: "Chile",
      basePrice: 2790,
      shortDescription: "Trek mythique au bout du monde.",
      description:
        "Trek guidé sur le circuit W : glaciers, lacs turquoise, condors et vues à couper le souffle sur les Torres. Niveau sportif requis.",
      images: [
        "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200",
        "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1200",
      ],
    },
    {
      name: "Lisbonne",
      country: "Portugal",
      basePrice: 420,
      shortDescription: "Pastéis de nata, Alfama et tramway 28.",
      description:
        "Court séjour culturel à Lisbonne : tour en tramway 28, dégustation de pastéis de Belém, soirée fado à Alfama et après-midi à Sintra.",
      images: [
        "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200",
        "https://images.unsplash.com/photo-1513735492246-483525079686?w=1200",
      ],
    },
  ];

  for (const d of destinations) {
    await prisma.destination.create({
      data: {
        name: d.name,
        country: d.country,
        basePrice: d.basePrice,
        shortDescription: d.shortDescription,
        description: d.description,
        images: {
          create: d.images.map((url, i) => ({ url, order: i, alt: d.name })),
        },
        availabilities: {
          create: [
            { startDate: addDays(14), endDate: addDays(21), spotsLeft: 8 },
            { startDate: addDays(30), endDate: addDays(37), spotsLeft: 12 },
            { startDate: addDays(60), endDate: addDays(70), spotsLeft: 6 },
          ],
        },
      },
    });
  }

  console.log("Seeding sample reservation...");
  const balireAvail = await prisma.availability.findFirst({
    where: { destination: { name: "Bali" } },
    orderBy: { startDate: "asc" },
  });
  if (balireAvail) {
    await prisma.reservation.create({
      data: {
        userId: user.id,
        destinationId: balireAvail.destinationId,
        availabilityId: balireAvail.id,
        numberOfPeople: 2,
        totalPrice: 1290 * 2,
      },
    });
    await prisma.availability.update({
      where: { id: balireAvail.id },
      data: { spotsLeft: { decrement: 2 } },
    });
  }

  console.log("✓ Seed complete");
  console.log(`  Admin: ${admin.email} / admin1234`);
  console.log(`  User:  ${user.email} / user1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
