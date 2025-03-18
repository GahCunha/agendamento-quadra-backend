const express = require('express');
const userController = require('./controllers/userController');
const authController = require('./controllers/authController');
const courtController = require('./controllers/courtController');
const bookingController = require('./controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('./middleware');

const router = express.Router();

// Rotas de usuário
router.post('/users', userController.createUser);
router.get('/users/:id', authMiddleware, userController.getUser);

// Rotas de autenticação
router.post('/auth/login', authController.login);

// Rotas de quadras (Apenas ADMIN pode criar)
router.post('/courts', authMiddleware, adminMiddleware, courtController.createCourt);
router.get('/courts', courtController.listCourts);
router.get('/courts/:id', courtController.getCourtById);

// Rotas de reservas
router.post('/bookings', authMiddleware, bookingController.createBooking);
router.get('/bookings/:userId', authMiddleware, bookingController.getUserBookings);
router.patch('/bookings/:id/cancel', authMiddleware, bookingController.cancelBooking);

// Aprovação de reservas (Apenas ADMIN pode aprovar/rejeitar)
router.patch('/bookings/:id/status', authMiddleware, adminMiddleware, bookingController.updateBookingStatus);

module.exports = router;
