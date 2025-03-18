const authService = require('../services/authService');

exports.login = async (req, res) => {
  try {
    console.log('📩 Recebendo body no login:', req.body); // Debug

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const { token } = await authService.login(req.body);
    res.json({ token });
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    res.status(401).json({ error: error.message });
  }
};
