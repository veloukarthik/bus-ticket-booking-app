const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const tests = [
      { source: 'Pondicherry', destination: 'Bangalore' },
      { source: 'pondicherry', destination: 'bangalore' },
      { source: 'Pondicherrry', destination: 'Bangalore' },
    ];

    const date = '2026-02-22';
    const start = new Date(date + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    for (const t of tests) {
      const sParam = `%${t.source.toLowerCase()}%`;
      const dParam = `%${t.destination.toLowerCase()}%`;
      const rows = await prisma.$queryRaw`
        SELECT t.id
        FROM Trip t
        WHERE lower(t.source) LIKE ${sParam}
          AND lower(t.destination) LIKE ${dParam}
          AND t.departure >= ${start}
          AND t.departure < ${end}
      `;
      console.log(`Test source='${t.source}' destination='${t.destination}' -> found ${rows.length}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await (new PrismaClient()).$disconnect();
  }
})();
