const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');

const createUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
};

const getUserById = async (id) => {
  return prisma.user.findUnique({ where: { id: parseInt(id) } });
};

const getUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
};
