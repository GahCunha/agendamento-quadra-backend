require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3030,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'seu_segredo_super_secreto',
};
