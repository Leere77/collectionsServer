const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { graphqlHTTP } = require("express-graphql");

const schema = require("./qraphqlSchemas");
const { authMiddleware } = require('./auth');

const app = express();

app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/project', { useNewUrlParser: true })
  .then(() => app.listen(3000, () => console.log(`listening at http://localhost:${3000}`)))
  .catch(error => { throw error });

app.use(authMiddleware);

app.use("/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send('error');
});

process.on("SIGINT", () => {
  mongoose.disconnect();
  process.exit();
});