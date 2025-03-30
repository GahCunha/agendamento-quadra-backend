const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");

const createUser = async ({ name, email, password }) => {
  const allowedEmailRegex = /^[a-zA-Z0-9._%+-]+@(aluno\.)?ifnmg\.edu\.br$/;

  email = email.toLowerCase();

  if (!allowedEmailRegex.test(email)) {
    throw new Error("E-mail não autorizado. Use um e-mail @ifnmg.edu.br ou @aluno.ifnmg.edu.br");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
};


const getUserById = async (id) => {
  return prisma.user.findUnique({ where: { id: parseInt(id) } });
};

const getUserProfile = async (id) => {
  return prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
};

const getUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getUserProfile,
};
