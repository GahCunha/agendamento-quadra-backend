const prisma = require('../prismaClient');

const createBooking = async ({ userId, courtId, date, startTime, endTime }) => {
  const now = new Date();
  const bookingDate = new Date(date);

  if (bookingDate < now) {
    throw new Error('Não é possível reservar para uma data no passado.');
  }

  // Buscar a quadra para verificar horários permitidos
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court) throw new Error('Quadra não encontrada.');

  if (!court.openTime || !court.closeTime) {
    throw new Error('Horários de funcionamento da quadra não definidos.');
  }

  // ✅ Criar `DateTime` correto para os horários da reserva
  const userStartTime = new Date(`${date}T${startTime}:00.000Z`);
  const userEndTime = new Date(`${date}T${endTime}:00.000Z`);

  if (isNaN(userStartTime) || isNaN(userEndTime)) {
    throw new Error('Horários inválidos. Certifique-se de enviar no formato correto.');
  }

  // ✅ Criar `DateTime` correto para os horários da quadra (sem avançar para o dia seguinte)
  const [openHour, openMinute] = court.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = court.closeTime.split(':').map(Number);

  const courtOpenTime = new Date(`${date}T${court.openTime}:00.000Z`);
  const courtCloseTime = new Date(`${date}T${court.closeTime}:00.000Z`);

  // Garante que `courtCloseTime` não ultrapasse a meia-noite do mesmo dia
  if (closeHour < openHour) {
    courtCloseTime.setDate(courtCloseTime.getDate() - 1);
  }

  // ✅ Debugging: imprimir os horários para ver o que está acontecendo
  console.log('📌 Booking Date:', bookingDate);
  console.log('📌 User Start Time:', userStartTime);
  console.log('📌 User End Time:', userEndTime);
  console.log('📌 Court Open Time:', courtOpenTime);
  console.log('📌 Court Close Time:', courtCloseTime);

  // ✅ Verifica se o horário está dentro do escopo da quadra
  if (userStartTime < courtOpenTime || userEndTime > courtCloseTime) {
    throw new Error(`A quadra só pode ser reservada entre ${court.openTime} e ${court.closeTime}.`);
  }

  // ✅ Verifica se o usuário já tem uma reserva no mesmo horário
  const existingBooking = await prisma.booking.findFirst({
    where: {
      userId,
      date: bookingDate,
      OR: [
        { startTime: { lt: userEndTime }, endTime: { gt: userStartTime } },
      ],
    },
  });

  if (existingBooking) {
    throw new Error('já tem uma reserva nesse horário.');
  }

  // ✅ Criar reserva somente se tudo estiver válido
  return prisma.booking.create({
    data: {
      userId,
      courtId,
      date: bookingDate,
      startTime: userStartTime,
      endTime: userEndTime,
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
