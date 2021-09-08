const { body } = require('express-validator');
const User = require('../models/user');

exports.validate = (method) => {
  switch (method) {
    case 'addProduct': {
      return [
        body('title')
          .isLength({ min: 4 })
          .withMessage('Title minimal 4 characters'),
        body('price')
          .not()
          .isEmpty()
          .withMessage('Please enter the price')
          .isFloat(),
        body('description')
          .isLength({ min: 8 })
          .withMessage('Description minimal 8 characters'),
      ];
    }

    case 'addUser': {
      return [
        body('name')
          .isLength({ min: 3, max: undefined })
          .withMessage('Name at least 3 characters long')
          .matches(/^[a-zA-Z ]+$/)
          .withMessage("Name can't contain special character or number"),
        body('userName')
          .isLength({ min: 5, max: undefined })
          .withMessage('Username must be at least 5 characters')
          .matches(/^[a-zA-Z0-9]+$/)
          .withMessage("Username can't contain space"),
        body('email')
          .isEmail()
          .withMessage('Enter a valid E-mail')
          .custom((value, { req }) => {
            return User.findOne({ email: value }).then((userDoc) => {
              if (userDoc) {
                return Promise.reject('E-mail already exist.');
              }
            });
          })
          .normalizeEmail(),
        body('password')
          .matches(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
          )
          .withMessage(
            'Password minimum eight characters, at least one letter, one number and one special character'
          ),
        body('confirmPassword').custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
          }
          return true;
        }),
      ];
    }

    case 'login': {
      return [
        body('email')
          .isEmail()
          .withMessage('Please Enter a valid Email')
          .normalizeEmail(),
        body('password').isLength({ min: 5 }).withMessage('Incorect Password'),
      ];
    }
  }
};
