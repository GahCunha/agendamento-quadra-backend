const prisma = require('../prismaClient');

const createBooking = async ({ userId, courtId, date, startTime, endTime }) => {
  // Verifica se a quadra existe
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court) throw new Error('Quadra não encontrada');

  // Verifica se já há reservas nesse horário
  const existingBooking = await prisma.booking.findFirst({
    where: {
      courtId,
      date: new Date(date),
      OR: [
        { startTime: { lte: new Date(endTime) }, endTime: { gte: new Date(startTime) } }
      ]
    }
  });

  if (existingBooking) throw new Error('Horário já reservado');

  return prisma.booking.create({
    data: {
      userId,
      courtId,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'PENDING',
    },
  });
};

const getUserBookings = async (userId) => {
  return prisma.booking.findMany({
    where: { userId: parseInt(userId) },
    include: { court: true },
  });
};

const cancelBooking = async (id, userId, userRole) => {
  const booking = await prisma.booking.findUnique({ where: { id: parseInt(id) } });

  if (!booking) {
    throw new Error('Reserva não encontrada.');
  }

  // Usuários comuns só podem cancelar suas próprias reservas
  if (userRole !== 'ADMIN' && booking.userId !== userId) {
    throw new Error('Usuário não tem permissão para cancelar esta reserva.');
  }

  return prisma.booking.update({
    where: { id: parseInt(id) },
    data: { status: 'CANCELLED' },
  });
};

const updateBookingStatus = async (id, status) => {
  const validStatuses = ['APPROVED', 'REJECTED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    throw new Error('Status inválido. Os valores permitidos são: APPROVED, REJECTED, CANCELLED.');
  }

  const booking = await prisma.booking.findUnique({ where: { id: parseInt(id) } });
  if (!booking) {
    throw new Error('Reserva não encontrada.');
  }

  return prisma.booking.update({
    where: { id: parseInt(id) },
    data: { status },
  });
};

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  updateBookingStatus,
};
