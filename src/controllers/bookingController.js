const bookingService = require('../services/bookingService');

exports.createBooking = async (req, res) => {
  try {
    const { courtId, date, startTime, endTime } = req.body;
    const userId = req.user.id; // ✅ Pegamos o usuário autenticado pelo token JWT

    if (!courtId || isNaN(courtId)) {
      return res.status(400).json({ error: 'O ID da quadra é obrigatório e deve ser um número válido.' });
    }

    const response = await bookingService.createBooking({ userId, courtId, date, startTime, endTime });

    const {createdAt, updatedAt, ...filteredResponse } = response;
    return res.status(201).json({
      message: "Reserva criada com sucesso.",
      booking: filteredResponse,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getUserBookings = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId); 

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID do usuário inválido' });
    }

    const bookings = await bookingService.getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = Number(req.user?.id)

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "ID do usuário inválido" })
    }

    const bookings = await bookingService.getMyBookings(userId)
    res.json(bookings)
  } catch (error) {
    console.error("Erro ao buscar reservas:", error)
    res.status(500).json({ error: error.message })
  }
}

exports.cancelBooking = async (req, res) => {
  try {
    await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role);
    res.json({ message: 'Reserva cancelada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const updatedBooking = await bookingService.updateBookingStatus(id, status, reason);
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getBookingsByCourt = async (req, res) => {
  const courtId = parseInt(req.params.courtId)

  if (isNaN(courtId)) {
    return res.status(400).json({ error: "ID da quadra inválido" })
  }

  try {
    const bookings = await bookingService.getBookingsByCourt(courtId)
    res.json(bookings)
  } catch (error) {
    console.error("Erro ao buscar reservas da quadra:", error)
    res.status(500).json({ error: error.message })
  }
}
