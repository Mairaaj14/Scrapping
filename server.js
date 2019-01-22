//App Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const rp = require('request-promise');
const table = require('cli-table');

// Require Articles and Comments Models
const Articles = require("./models/Articles.js");
const Comments = require("./models/Comments.js");

// Tools for Scrapping
var cheerio = require('cheerio');
var request = require('request');

// Start Express
const app = express();

// Initiate body-parser for app
app.use(bodyParser.urlencoded({
    extended: false
}));

// Express handlebars
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// Make public a static dir
app.use(express.static("public"));

// If else statements

if(process.env.NODE_ENV == 'production'){

    mongoose.connect('mongodb://');
  }
  else{
    mongoose.connect('mongodb://localhost/Scrapper');
  }
  
  const db = mongoose.connection;
  
  // Show any Mongoose errors
  db.on('error', function(err) {
    console.log('Mongoose Error: ', err);
  });
  
  // Once logged in to the db through mongoose, log a success message
  db.once('open', function() {
    console.log('Mongoose connection successful.');
  });
  
  // Import Routes/Controller
  const router = require('./controllers/controller.js');
  app.use('/', router);
  
  
  // Launch App
  const port = process.env.PORT || 3000;
  app.listen(port, function(){
    console.log('Running on port: ' + port);
  });