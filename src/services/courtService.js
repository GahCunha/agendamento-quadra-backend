const prisma = require('../prismaClient');

const createCourt = async ({ name, location, description, openTime, closeTime }) => {
  return prisma.court.create({
    data: { name, location, description, openTime, closeTime },
  });
};

const updateCourt = async (id, { name, location, description, openTime, closeTime }) => {
  return prisma.court.update({
    where: { id: parseInt(id) },
    data: { name, location, description, openTime, closeTime },
  });
};

const deleteCourt = async (id) => {
  return prisma.court.delete({ where: { id: parseInt(id) } });
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
  updateCourt,
  deleteCourt,
};
