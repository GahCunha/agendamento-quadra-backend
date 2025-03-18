const express = require('express');
const userController = require('./controllers/userController');
const courtController = require('./controllers/courtController');
const bookingController = require('./controllers/bookingController');
const authController = require('./controllers/authController');
const authMiddleware = require('./middleware');

const router = express.Router();

// Rotas de usuário
router.post('/users', userController.createUser);
router.get('/users/:id', userController.getUser);

// Rotas de autenticação
router.post('/auth/login', authController.login);

// Rotas de quadras
router.post('/courts', authMiddleware, courtController.createCourt);
router.get('/courts', courtController.listCourts);
router.get('/courts/:id', courtController.getCourtById);

// Rotas de reservas
router.post('/bookings', authMiddleware, bookingController.createBooking);
router.get('/bookings/:userId', authMiddleware, bookingController.getUserBookings);
router.patch('/bookings/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;

