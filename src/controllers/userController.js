const userService = require("../services/userService");

exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002" && error.meta && error.meta.target.includes("email")) {
      res.status(409).json({ error: "Email já está em uso." });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
