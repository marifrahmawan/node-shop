const Product = require('../models/product');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator');

const ITEMS_PER_PAGE = 4;

exports.getProducts = (req, res, next) => {
  let page = +req.query.page;
  let totalItems;

  Product.find({ userId: req.user._id })
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      if (!page) {
        page = 1;
      }
      return Product.find({ userId: req.user._id })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    // .populate('userId')
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    product: {
      title: '',
      price: '',
      description: '',
      image: '',
    },
    errorMessage: '',
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: 'Attachd file is not an image',
      validationErrors: [],
    });
  }
  const imagePath = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    image: imagePath,
    userId: req.user._id,
  });

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  product
    .save()
    .then(() => {
      console.log('Created a Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;
  if (!editMode) {
    res.redirect('/');
  } else {
    Product.findById(prodId)
      .then((product) => {
        if (product.userId.toString() !== req.user._id.toString()) {
          return res.redirect('/');
        }
        return res.render('admin/edit-product', {
          product: product,
          pageTitle: 'Edit ' + product.title,
          path: 'admin/edit-product',
          editing: editMode,
          errorMessage: '',
          validationErrors: [],
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);
  console.log(image);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if (image) {
        fileHelper.deleteFile(product.image);
        product.image = image.path;
      }
      return product.save().then(() => {
        console.log('Updated Product !');
        res.redirect('/admin/products');
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error('Product not found'));
      }
      fileHelper.deleteFile(product.image);
      return Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(() => {
          req.user.removeFromCart(prodId);
        })
        .then((product) => {
          res.status(200).json({ message: 'Success !' });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed Deleting Product' });
    });
};
