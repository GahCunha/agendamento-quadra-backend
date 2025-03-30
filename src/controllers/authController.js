const authService = require("../services/authService");

exports.login = async (req, res) => {
  try {
    console.log("📩 Recebendo body no login:", req.body); // Debug

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const { token } = await authService.login(req.body);
    res.json({ token });
  } catch (error) {
    console.error("❌ Erro no login:", error.message);
    res.status(401).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const newAccessToken = await authService.refreshToken(refreshToken);
    return res.json({ token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const message = await authService.forgotPasswordService(req.body.email);
    res.status(200).json({ message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const message = await authService.resetPasswordService(token, newPassword);
    res.status(200).json({ message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
