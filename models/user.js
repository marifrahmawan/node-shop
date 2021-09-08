const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpired: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

//* Add Product to Cart
userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  const updatedCartItems = [...this.cart.items];
  let newQuantity = 1;

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

//* Remove Item from Cart
userSchema.methods.removeFromCart = function (productId) {
  const updatedCart = this.cart.items.filter((items) => {
    return items.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCart;
  return this.save();
};

//* Clear Cart after Order
userSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save();
};

//* Add Order
// userSchema.methods.addOrder = function () {
//   console.log(order);
//   const order = {
//     products: this.cart.items,
//     user: {
//       name: this.name,
//       userId: this._id,
//     },
//   };
//   return Order.create(order)
//     .then((order) => {
//       return order;
//     })
//     .then(() => {
//       this.cart.items = [];
//       return this.save();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

module.exports = mongoose.model('User', userSchema);
