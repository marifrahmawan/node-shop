# Node-shop

An E-commerce website build with Nodejs-Expressjs and template engine .ejs.

## Installation

Clone this repository and use npm package manager

```bash
npm install
```

## Usage

Open the auth.js inside controller folder and change the transporter variable with youre own email service for authentication.

```javascript
const transporter = nodemailer.createTransport({
  host: '',
  port: 2525,
  auth: {
    user: '',
    pass: '',
  },
});
```
