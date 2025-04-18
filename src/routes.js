const express = require("express");
const userController = require("./controllers/userController");
const authController = require("./controllers/authController");
const courtController = require("./controllers/courtController");
const bookingController = require("./controllers/bookingController");
const blockedTimeController = require("./controllers/blockedTimeController"); // ✅ ADICIONAR ESTA LINHA
const { authMiddleware, adminMiddleware } = require("./middleware");

const router = express.Router();

// Rotas de usuário
router.post("/users", userController.createUser);
router.get("/users/me", authMiddleware, userController.getMe);
router.get("/users/:id", authMiddleware, userController.getUser);

// Rotas de autenticação
router.post("/auth/login", authController.login);

// Nova rota para refresh token
router.post("/auth/refresh", authController.refreshToken);

// Rotas de quadras (Apenas ADMIN pode criar)
router.post(
  "/courts",
  authMiddleware,
  adminMiddleware,
  courtController.createCourt
);
router.get("/courts", courtController.listCourts);
router.get("/courts/:id", courtController.getCourtById);
router.patch(
  "/courts/:id",
  authMiddleware,
  adminMiddleware,
  courtController.updateCourt
);
router.delete(
  "/courts/:id",
  authMiddleware,
  adminMiddleware,
  courtController.deleteCourt
);

// Rotas de reservas
router.post("/bookings", authMiddleware, bookingController.createBooking);
router.get("/bookings/me", authMiddleware, bookingController.getMyBookings);
router.get(
  "/bookings/:userId",
  authMiddleware,
  bookingController.getUserBookings
);
router.patch(
  "/bookings/:id/cancel",
  authMiddleware,
  bookingController.cancelBooking
);

// Aprovação de reservas (Apenas ADMIN pode aprovar/rejeitar)
router.patch(
  "/bookings/:id/status",
  authMiddleware,
  adminMiddleware,
  bookingController.updateBookingStatus
);

router.get(
  "/courts/:courtId/bookings",
  authMiddleware,
  bookingController.getBookingsByCourt
);
router.post(
  "/courts/:courtId/blocked-times",
  authMiddleware,
  adminMiddleware,
  blockedTimeController.blockTime
);
router.get(
  "/courts/:courtId/blocked-times",
  authMiddleware,
  blockedTimeController.getBlockedTimes
);
router.delete(
  "/blocked-times/:id",
  authMiddleware,
  adminMiddleware,
  blockedTimeController.deleteBlockedTime
);

// Rota para solicitar a redefinição da senha
router.post("/auth/forgot-password", authController.forgotPassword);

// Rota para redefinir a senha usando o token
router.post("/auth/reset-password", authController.resetPassword);


module.exports = router;
