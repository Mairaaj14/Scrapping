//==================
//App Dependencies
//==================
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const rp = require('request-promise');
//const table = require('cli-table');
//const path = require('path');

//=====================
// Tools for Scrapping
//=====================
var cheerio = require('cheerio');
var request = require('request');
var db = require('./models');
// Start Express
var app = express();
var PORT = 3000;

//=================================
// Initiate body-parser for app for data parsing - middleware
//=================================
//app.use(logger("dev"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Make public a static dir
//app.use(express.static(path.join(__dirname, "public")));

//===============
//Connect to mongodb
//===============
var mongodb_uri = process.env.mongodb_uri || "mongodb: //localhost/Scrapping";
mongoose.Promise = Promise;
mongoose.connect(mongodb_uri, { useNewUrlParser: true });

//mongoose.connect("mongodb://localhost/scrapper", { useNewUrlParser: true });
//mongoose.Promise = global.Promise
//app.use(bodyParser.urlencoded({
    //extended: false
//}));

//====================
// Express handlebars
//====================

app.engine('handlebars', exphbs({defaultLayout:'main' }));
app.set('view engine', 'handlebars');
//=========
// Routes
//=========
app.get("/", function(req, res) {
  db.Article.find({saved: false})
  .then(function(dbArticles) {

    // Object 
    var articles = {
      articles: dbArticles
    }
    res.render("index", articles);
  })
  .catch(function(err) {
    console.log("Error found: ", err);
  })
})

// Route for Scrapping 
app.get("/scrape", function(req, res) {
  db.Article.find({})
  .then(function(dbContent) {
    if(dbContent.length > 0 ) {
      console.log("Scrapping up to date!");

    } else {
      request("https://www.sfchronicle.com/", function (err, res, body) {
        if (err) {
          console.log("Error found: ", err);

        } else {
          var $ = cheerio.load(body);

          $("#.headline").each(function (i, element) {
            // Empty string where scrapped articles will go 
            var articleInfo = {};

            articleInfo.title = $(this)
            .children(".data-tb-shadow-region-title")
            .children("a")
            .text()

            articleInfo.summary = $(this)
            .children(".blurb")
            .text()

            articleInfo.url = "https://www.sfchronicle.com/" + $(this)
            .children(".data-tb-shadow-region-link")
            .children("a")
            .attr("href");

            db.Article.create(articleInfo)
            .then(function (dbArticle) {
              console.log(dbArticle);
            })
            .catch(function (err) {
              console.log(err);
            });

          });
        }
        res.setEncoding("Scrapping Completed!");
      })
    }
  })
  .catch(function(err) {
    console.log(err);
  })
})
// Route for all saved articles

app.get("/savedArticles", function(req, res) {
  db.Article.find({saved: true})
  .then(function(dbArticles) {

    var articles = { articles: dbArticles
    }
    res.render("saved", articles);
  })
  .catch(function(err) {
    console.log(err);
  })
})

// Route to delete all articles from database

app.get("/deleteArticles", function(req, res) {
  db.Article.deleteMany({})
  .then(function(result) {
    console.log("Articles have been deleted!");
    res.json(result);
  })
  .catch(function(err) {
    console.log(err);
  })

})

// Route for updating saved articles
app.put("/savedArticle/:id", function(req, res) {
  db.Article.findOneAndUpdate({id: req.params.id}, {$set: {saved: true}})
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    console.log(err);
  })
})

//==============
  // Server
//==============
  app.listen(PORT, function() {
    console.log("Running on port: " + PORT);
  });