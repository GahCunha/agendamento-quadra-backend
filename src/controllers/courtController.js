const courtService = require('../services/courtService');

exports.createCourt = async (req, res) => {
  try {
    const court = await courtService.createCourt(req.body);
    res.status(201).json({ message: "Quadra criada com sucesso", court });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.listCourts = async (req, res) => {
  try {
    const courts = await courtService.listCourts();
    res.json(courts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourtById = async (req, res) => {
  try {
    const court = await courtService.getCourtById(req.params.id);
    if (!court) return res.status(404).json({ error: 'Quadra não encontrada' });

    res.json(court);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
