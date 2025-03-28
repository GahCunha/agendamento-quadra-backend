const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");
const { JWT_SECRET } = require("../config");

const login = async ({ email, password }) => {
  console.log("🔍 Verificando email:", email); // Debug para ver o que está chegando

  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Credenciais inválidas");
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return { token };
};

function refreshToken(refreshToken) {
  return new Promise((resolve, reject) => {
    if (!refreshToken) {
      return reject(new Error("Refresh token is missing"));
    }

    // Verifica o refresh token usando a chave secreta
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return reject(new Error("Invalid refresh token"));
        }

        // Supondo que o payload do refresh token contenha o userId
        const { userId } = decoded;

        // Gere um novo token de acesso (por exemplo, com validade de 15 minutos)
        const newAccessToken = jwt.sign(
          { userId },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );
        resolve(newAccessToken);
      }
    );
  });
}

module.exports = { login, refreshToken };
