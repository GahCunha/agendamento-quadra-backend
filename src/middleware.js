const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  const token = authHeader.split(' ')[1]; // Extraindo apenas o token
  console.log('🔍 Token recebido:', token); // Debug

  if (!token) {
    return res.status(401).json({ message: 'Token inválido ou ausente' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decodificado:', decoded); // Debug

    req.user = decoded; // Adiciona o usuário ao request
    next();
  } catch (error) {
    console.error('❌ Erro na validação do token:', error.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;
