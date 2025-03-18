const prisma = require('../prismaClient');

const createCourt = async ({ name, location, description }) => {
  return prisma.court.create({
    data: { name, location, description },
  });
};

const listCourts = async () => {
  return prisma.court.findMany();
};

const getCourtById = async (id) => {
  return prisma.court.findUnique({ where: { id: parseInt(id) } });
};

module.exports = {
  createCourt,
  listCourts,
  getCourtById,
};
