const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");
const { JWT_SECRET } = require("../config");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

async function forgotPasswordService(email) {
  // Verifica se o usuário existe
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  // Gera um token aleatório e define expiração (1 hora)
  const token = crypto.randomBytes(20).toString("hex");
  const expiration = new Date(Date.now() + 3600000);

  // Atualiza o usuário com token e expiração
  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expiration,
    },
  });

  // Configura o transportador do Nodemailer (ajuste as configurações SMTP conforme necessário)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.USER_EMAIL}`, 
      pass: `${process.env.PASSWORD_EMAIL}`, // Substitua pela senha de aplicativo gerada
    },
  });
  console.log(process.env.USER_EMAIL)
  const resetUrl = `${process.env.RESET_PASSWORD_URL}${token}`;
  const message = `Você está recebendo este e-mail porque foi solicitada a redefinição de senha para sua conta.
  
Clique no link para redefinir sua senha: ${resetUrl}

Caso não tenha solicitado, ignore este e-mail.`;

  await transporter.sendMail({
    from: '"Suporte" <suporte@seudominio.com>',
    to: user.email,
    subject: "Redefinição de Senha",
    text: message,
  });

  return "E-mail de redefinição de senha enviado.";
}

async function resetPasswordService(token, newPassword) {
  // Procura o usuário que possua o token e que o token ainda não tenha expirado
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new Error("Token inválido ou expirado.");
  }

  // Gera o hash da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Atualiza a senha e remove os campos de reset
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return "Senha atualizada com sucesso.";
}
module.exports = {
  login,
  refreshToken,
  forgotPasswordService,
  resetPasswordService,
};
