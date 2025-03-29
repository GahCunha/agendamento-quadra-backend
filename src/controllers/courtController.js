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

    const filteredCourts = courts.map(({ createdAt, updatedAt, ...court }) => court);
    res.json(filteredCourts);
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

exports.updateCourt = async (req, res) => {
  try {
    const court = await courtService.updateCourt(req.params.id, req.body);
    res.json({ message: "Quadra atualizada com sucesso", court });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCourt = async (req, res) => {
  try {
    await courtService.deleteCourt(req.params.id);
    res.json({ message: "Quadra excluída com sucesso" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};