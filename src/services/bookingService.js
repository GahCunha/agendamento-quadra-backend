const prisma = require('../prismaClient');

const createBooking = async ({ userId, courtId, date, startTime, endTime }) => {
  const now = new Date();
  const bookingDate = new Date(date);

  if (bookingDate < now) {
    throw new Error('Não é possível reservar para uma data no passado.');
  }

  // Verifica se o usuário já tem uma reserva no mesmo horário
  const existingBooking = await prisma.booking.findFirst({
    where: {
      userId,
      date: bookingDate,
      OR: [
        { startTime: { lte: new Date(endTime) }, endTime: { gte: new Date(startTime) } },
      ],
    },
  });

  if (existingBooking) {
    throw new Error('Usuário já tem uma reserva nesse horário.');
  }

  return prisma.booking.create({
    data: {
      userId,
      courtId,
      date: bookingDate,
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
