const blockedTimeService = require('../services/blockedTimeService');

exports.blockTime = async (req, res) => {
  try {
    const response = await blockedTimeService.blockTime(req.body);

    if (response.status === 'fail') {
      return res.status(400).json({
        message: response.message,
        blockedTime: response.blockedTime,
      });
    }

    return res.status(201).json({
      message: response.message,
      blockedTime: response.blockedTime,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBlockedTimes = async (req, res) => {
  try {
    const courtId = parseInt(req.params.courtId); // ✅ Converte para número

    if (isNaN(courtId)) {
      return res.status(400).json({ error: 'O ID da quadra deve ser um número válido.' });
    }

    const blockedTimes = await blockedTimeService.getBlockedTimes(courtId);
    res.json(blockedTimes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBlockedTime = async (req, res) => {
  try {
    await blockedTimeService.deleteBlockedTime(req.params.id);
    res.json({ message: 'Bloqueio removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
