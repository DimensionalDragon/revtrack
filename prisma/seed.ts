import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // User demo
  await prisma.user.upsert({
    where: { email: 'demo@revtrack.com' },
    update: {},
    create: {
      email: 'demo@revtrack.com',
      password: await bcrypt.hash('demo123', 10),
    },
  })

  // Products
  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Produk A', price: 150000 } }),
    prisma.product.create({ data: { name: 'Produk B', price: 275000 } }),
    prisma.product.create({ data: { name: 'Produk C', price: 89000 } }),
    prisma.product.create({ data: { name: 'Produk D', price: 320000 } }),
    prisma.product.create({ data: { name: 'Produk E', price: 210000 } }),
  ])

  // Transactions — 50 data, 30 hari terakhir
  const statuses = ['completed', 'pending', 'cancelled']

  for (let i = 0; i < 50; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;

    const now = new Date();
    const randomDate = now.getDate() - Math.floor(Math.random() * (now.getDate() - 1));
    now.setDate(randomDate);

    await prisma.transaction.create({
      data: {
        productId: product.id,
        quantity,
        total: product.price * quantity,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: now,
      },
    })
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() });