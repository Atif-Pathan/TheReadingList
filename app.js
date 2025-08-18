// app.js
const express = require('express');
const path = require('path');

const app = express();
const indexRouter = require('./routes/indexRoutes');
const bookRouter = require('./routes/bookRoutes');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `My Reading List -  Server is running on http://localhost:${PORT}`,
  );
});
