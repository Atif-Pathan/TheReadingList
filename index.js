// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const indexRouter = require('./routes/indexRoutes');
const bookRouter = require('./routes/bookRoutes');
const categoryRouter = require('./routes/categoryRoutes');

// mount the styles which will be in the public folder
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

// This middleware is crucial for parsing form data from POST requests
app.use(express.urlencoded({ extended: true }));
// Set the view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/books', bookRouter);
app.use('/categories', categoryRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error'); // Renders views/error.ejs
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `My Reading List -  Server is running on http://localhost:${PORT}`,
  );
});

// module.exports = app;
