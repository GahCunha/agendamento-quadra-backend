const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');
const { JWT_SECRET } = require('../config');

const login = async ({ email, password }) => {
  console.log('🔍 Verificando email:', email); // Debug para ver o que está chegando

  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Credenciais inválidas');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

  return { token, userId:user.id };
};

module.exports = { login };
