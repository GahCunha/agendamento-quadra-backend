const { format } = require("date-fns");
const prisma = require("../prismaClient");

const createBooking = async ({ userId, courtId, date, startTime, endTime }) => {
  const now = new Date();
  const bookingDate = new Date(date);

  if (bookingDate < now) {
    throw new Error("Não é possível reservar para uma data no passado.");
  }

  // Buscar a quadra para verificar horários permitidos
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court) throw new Error("Quadra não encontrada.");

  if (!court.openTime || !court.closeTime) {
    throw new Error("Horários de funcionamento da quadra não definidos.");
  }

  // Criar DateTime para os horários da reserva
  const userStartTime = new Date(`${date}T${startTime}:00.000Z`);
  const userEndTime = new Date(`${date}T${endTime}:00.000Z`);

  if (isNaN(userStartTime) || isNaN(userEndTime)) {
    throw new Error(
      "Horários inválidos. Certifique-se de enviar no formato correto."
    );
  }

  // Criar DateTime para os horários da quadra
  const [openHour, openMinute] = court.openTime.split(":").map(Number);
  const [closeHour, closeMinute] = court.closeTime.split(":").map(Number);

  const courtOpenTime = new Date(`${date}T${court.openTime}:00.000Z`);
  const courtCloseTime = new Date(`${date}T${court.closeTime}:00.000Z`);

  // Ajusta courtCloseTime se o horário de fechamento ultrapassar a meia-noite
  if (closeHour < openHour) {
    courtCloseTime.setDate(courtCloseTime.getDate() - 1);
  }

  // Debug: imprimir os horários
  console.log("📌 Booking Date:", bookingDate);
  console.log("📌 User Start Time:", userStartTime);
  console.log("📌 User End Time:", userEndTime);
  console.log("📌 Court Open Time:", courtOpenTime);
  console.log("📌 Court Close Time:", courtCloseTime);

  // Verifica se o horário da reserva está dentro do horário de funcionamento da quadra
  if (userStartTime < courtOpenTime || userEndTime > courtCloseTime) {
    throw new Error(
      `A quadra só pode ser reservada entre ${court.openTime} e ${court.closeTime}.`
    );
  }

  // Obter bloqueios para a quadra (tanto específicos quanto recorrentes)
  const dayOfWeek = bookingDate.getDay(); // 0 = Domingo, 6 = Sábado
  const blockedTimes = await prisma.blockedTime.findMany({
    where: {
      courtId,
      OR: [
        { date: bookingDate }, // bloqueios específicos para a data
        { recurringDay: dayOfWeek }, // bloqueios recorrentes para o dia da semana
      ],
    },
  });

  // Verifica se algum bloqueio interfere na reserva
  const isBookingBlocked = blockedTimes.some((b) => {
    // Se não houver startTime e endTime, o bloqueio cobre o dia inteiro
    if (!b.startTime && !b.endTime) {
      return true;
    }
    // Define a data para o bloqueio:
    // Se b.date existir, usa a data do bloqueio; se não, assume a data da reserva (para recorrência)
    const blockDateStr = b.date
      ? b.date.split("T")[0]
      : format(bookingDate, "yyyy-MM-dd");

    // Se houver somente um dos horários definidos, considere o bloqueio como de dia inteiro
    if (!b.startTime || !b.endTime) {
      return true;
    }

    // Cria os intervalos do bloqueio
    const blockStart = new Date(`${blockDateStr}T${b.startTime}:00.000Z`);
    const blockEnd = new Date(`${blockDateStr}T${b.endTime}:00.000Z`);

    // Retorna true se houver sobreposição entre o intervalo da reserva e o bloqueio
    return userStartTime < blockEnd && userEndTime > blockStart;
  });

  if (isBookingBlocked) {
    throw new Error("Este horário está bloqueado para reservas.");
  }

  // Verifica se o usuário já tem uma reserva que se sobrepõe ao horário desejado
  const existingBooking = await prisma.booking.findFirst({
    where: {
      userId,
      date: bookingDate,
      OR: [{ startTime: { lt: userEndTime }, endTime: { gt: userStartTime } }],
    },
  });

  if (existingBooking) {
    throw new Error("Usuário já tem uma reserva nesse horário.");
  }

  // Cria a reserva se tudo estiver válido
  return prisma.booking.create({
    data: {
      userId,
      courtId,
      date: bookingDate,
      startTime: userStartTime,
      endTime: userEndTime,
      status: "PENDING",
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
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(id) },
  });

  if (!booking) {
    throw new Error("Reserva não encontrada.");
  }

  // Usuários comuns só podem cancelar suas próprias reservas
  if (userRole !== "ADMIN" && booking.userId !== userId) {
    throw new Error("Usuário não tem permissão para cancelar esta reserva.");
  }

  return prisma.booking.update({
    where: { id: parseInt(id) },
    data: { status: "CANCELLED" },
  });
};

const updateBookingStatus = async (id, status, reason = null) => {
  const validStatuses = ["APPROVED", "REJECTED", "CANCELLED"];

  if (!validStatuses.includes(status)) {
    throw new Error(
      "Status inválido. Os valores permitidos são: APPROVED, REJECTED, CANCELLED."
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(id) },
  });

  if (!booking) {
    throw new Error("Reserva não encontrada.");
  }

  const updateData = { status };

  if (status === "REJECTED") {
    updateData.reason = reason || "Agendamento rejeitado.";
  } else {
    updateData.reason = null;
  }

  return prisma.booking.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
};


const getMyBookings = async (userId) => {
  return prisma.booking.findMany({
    where: { userId: parseInt(userId) },
    include: { court: true },
  });
};

async function getBookingsByCourt(courtId) {
  return prisma.booking.findMany({
    where: {
      courtId,
      status: {
        not: "CANCELLED",
      },
    },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });
}
module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  updateBookingStatus,
  getMyBookings,
  getBookingsByCourt,
};
