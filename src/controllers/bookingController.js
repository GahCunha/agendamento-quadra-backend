const bookingService = require('../services/bookingService');

exports.createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
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
    const { status } = req.body;

    const updatedBooking = await bookingService.updateBookingStatus(id, status);
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};