require('dotenv').config()
//App Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const rp = require('request-promise');
const table = require('cli-table');
const path = require('path');


// Tools for Scrapping
var cheerio = require('cheerio');
var request = require('request');

// Start Express
var app = express();
var PORT = process.env.PORT || 3000;


// Initiate body-parser for app for data parsing
//app.use(logger("dev"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//app.use(bodyParser.urlencoded({
    //extended: false
//}));
// Make public a static dir
app.use(express.static(path.join(__dirname, "public")));



// Express handlebars
app.set('views', path.join(__dirname, '/views'));
app.engine('handlebars', exphbs({defaultLayout:'main', extname:'.handlebars', layoutsDir: 'views/layouts'}));
app.set('view engine', 'handlebars');

// Routes
var news = require('/routes/newsRoutes.js');
app.use(news);

// If else statements

//if(process.env.NODE_ENV == 'production'){

    //mongoose.connect('mongodb://');
  //}
  //else{
    //mongoose.connect('mongodb://localhost/Scrapper');
  //}
mongoose.connect("mongodb://localhost/scrapper", { useNewUrlParser: true });
mongoose.Promise = global.Promise

  
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
  //const router = require('./controllers/controllers.js');
  //app.use('/', router);
  
  
  // Launch App

  app.listen(PORT, function() {
    console.log("Running on port: " + PORT);
  });