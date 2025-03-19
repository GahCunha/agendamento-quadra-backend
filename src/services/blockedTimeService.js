const prisma = require('../prismaClient');

const blockTime = async ({ courtId, date, startTime, endTime, recurringDay, reason }) => {
  if (!date && recurringDay === undefined) {
    throw new Error('É necessário definir uma data específica ou um dia recorrente.');
  }

  // ✅ Verifica se a quadra existe antes de tentar criar o bloqueio
  const courtExists = await prisma.court.findUnique({ where: { id: courtId } });
  if (!courtExists) {
    throw new Error('A quadra informada não existe.');
  }

  // ✅ Verifica se já existe um bloqueio idêntico para o mesmo dia e horário
  const existingBlockedTime = await prisma.blockedTime.findFirst({
    where: {
      courtId,
      startTime: startTime || null,
      endTime: endTime || null,
      OR: [
        { date: date ? new Date(date) : null }, // Bloqueios específicos para uma data
        { recurringDay: recurringDay !== undefined ? recurringDay : null }, // Bloqueios semanais
      ],
    },
  });

  if (existingBlockedTime && existingBlockedTime.recurringDay === recurringDay) {
    return {
      status: 'fail',
      message: 'Já existe um bloqueio para esse dia e horário.',
      blockedTime: existingBlockedTime,
    };
  }

  const newBlockedTime = await prisma.blockedTime.create({
    data: {
      courtId,
      date: date ? new Date(date) : null,
      startTime: startTime || null,
      endTime: endTime || null,
      recurringDay: recurringDay !== undefined ? parseInt(recurringDay) : null,
      reason,
    },
  });

  return {
    status: 'success',
    message: 'Bloqueio criado com sucesso.',
    blockedTime: newBlockedTime,
  };
};

const getBlockedTimes = async (courtId) => {
  return prisma.blockedTime.findMany({
    where: {
      courtId: parseInt(courtId), // ✅ Converte para número
    },
  });
};

const deleteBlockedTime = async (id) => {
  return prisma.blockedTime.delete({ where: { id: parseInt(id) } });
};

module.exports = { blockTime, getBlockedTimes, deleteBlockedTime };
