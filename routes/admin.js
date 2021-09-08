const express = require('express');

const adminController = require('../controllers/admin');
const userValidation = require('../middleware/user-input-validation');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

//* /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

//* GET, POST => PRODUCTS
router.get('/add-product', isAuth, adminController.getAddProduct);
router.post(
  '/add-product',
  isAuth,
  userValidation.validate('addProduct'),
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
  '/edit-product',
  isAuth,
  userValidation.validate('addProduct'),
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
