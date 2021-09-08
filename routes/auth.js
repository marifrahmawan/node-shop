const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');
const userValidation = require('../middleware/user-input-validation');

//* Sign Up Route
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  userValidation.validate('addUser'),
  authController.postSignup
);

//* Login Route
router.get('/login', authController.getLogin);
router.post(
  '/login',
  userValidation.validate('login'),
  authController.postLogin
);

//* Logout Route
router.post('/logout', authController.postLogout);

//* Reset Password
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
