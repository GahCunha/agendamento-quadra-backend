const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');

// Middleware de autenticação (verifica se o token é válido)
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Token ausente' });
  }

  const token = authHeader.split(' ')[1]; // Pega só o token
  if (!token) {
    return res.status(401).json({ message: 'Token inválido ou ausente' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adiciona as informações do usuário no request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar se o usuário é ADMIN
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar essa ação.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
