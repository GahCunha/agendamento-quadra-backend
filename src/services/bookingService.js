const { format, startOfWeek, endOfWeek } = require("date-fns");
const prisma = require("../prismaClient");

const createBooking = async ({ userId, courtId, date, startTime, endTime }) => {
  const now = new Date();
  const bookingDate = new Date(date);

  if (bookingDate < now) {
    throw new Error("Não é possível reservar para uma data no passado.");
  }

  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court) throw new Error("Quadra não encontrada.");
  if (!court.openTime || !court.closeTime) {
    throw new Error("Horários de funcionamento da quadra não definidos.");
  }

  // 🛑 Verifica se o usuário já tem 3 reservas nesta semana
  const weekStart = startOfWeek(bookingDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(bookingDate, { weekStartsOn: 1 });
  
  const bookingsThisWeek = await prisma.booking.count({
    where: {
      userId,
      startTime: {
        gte: weekStart,
        lte: weekEnd,
      },
      status: {
        in: ["PENDING", "APPROVED"],
      },
    },
  });

  if (bookingsThisWeek >= 3) {
    throw new Error("Você já atingiu o limite de 3 reservas nesta semana.");
  }

  const userStartTime = new Date(`${date}T${startTime}:00.000Z`);
  const userEndTime = new Date(`${date}T${endTime}:00.000Z`);

  if (isNaN(userStartTime) || isNaN(userEndTime)) {
    throw new Error("Horários inválidos. Certifique-se de enviar no formato correto.");
  }

  const [openHour, openMinute] = court.openTime.split(":").map(Number);
  const [closeHour, closeMinute] = court.closeTime.split(":").map(Number);
  const courtOpenTime = new Date(`${date}T${court.openTime}:00.000Z`);
  const courtCloseTime = new Date(`${date}T${court.closeTime}:00.000Z`);

  if (closeHour < openHour) {
    courtCloseTime.setDate(courtCloseTime.getDate() - 1);
  }

  console.log("📌 Booking Date:", bookingDate);
  console.log("📌 User Start Time:", userStartTime);
  console.log("📌 User End Time:", userEndTime);
  console.log("📌 Court Open Time:", courtOpenTime);
  console.log("📌 Court Close Time:", courtCloseTime);

  if (userStartTime < courtOpenTime || userEndTime > courtCloseTime) {
    throw new Error(`A quadra só pode ser reservada entre ${court.openTime} e ${court.closeTime}.`);
  }

  const dayOfWeek = bookingDate.getDay();
  const blockedTimes = await prisma.blockedTime.findMany({
    where: {
      courtId,
      OR: [
        { date: bookingDate },
        { recurringDay: dayOfWeek },
      ],
    },
  });

  const isBookingBlocked = blockedTimes.some((b) => {
    if (!b.startTime && !b.endTime) return true;

    const blockDateStr = b.date
      ? b.date.split("T")[0]
      : format(bookingDate, "yyyy-MM-dd");

    if (!b.startTime || !b.endTime) return true;

    const blockStart = new Date(`${blockDateStr}T${b.startTime}:00.000Z`);
    const blockEnd = new Date(`${blockDateStr}T${b.endTime}:00.000Z`);

    return userStartTime < blockEnd && userEndTime > blockStart;
  });

  if (isBookingBlocked) {
    throw new Error("Este horário está bloqueado para reservas.");
  }

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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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