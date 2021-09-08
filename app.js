const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const csrfProtection = csrf();
const flash = require('connect-flash');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/nodejs-shop';
const storeSession = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const erorController = require('./controllers/error');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

//* For static files like .css, .js or everything have file extensions you use in UI.
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

//* Use and store session
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: storeSession,
  })
);

//! Put the csrf protection after body-parsing middleware
//! (express.urlencoded)

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// app.get('/500', erorController.get500);
app.use(erorController.get404);
// app.use((error, req, res, next) => {
//   res.status(500).render('500', {
//     pageTitle: 'Error',
//     path: '/500',
//     isAuthenticated: req.session.isLoggedIn,
//   });
// });

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(3000, 'localhost', () => {
      console.log('Server is running');
    });
  })
  .catch((err) => {
    console.log(err);
  });
