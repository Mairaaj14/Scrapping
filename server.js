//==================
//App Dependencies
//==================
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

//=====================
// Tools for Scrapping
//=====================
var cheerio = require("cheerio");
var request = require("request");
var db = require("./models");
// Start Express
var app = express();
var PORT = process.env.PORT || 3000;

//=================================
// Initiate body-parser for app for data parsing - middleware
//=================================

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));
// Make public a static dir
//app.use(express.static(path.join(__dirname, "public")));


//===================
//Connect to mongodb
//===================
//var MONGODB_URI = process.env.MONGODB_URI || "mongodb: //localhost/Headlines";
//mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

mongoose.connect('mongodb://localhost/Headlines', { useNewUrlParser: true });
//====================
// Express handlebars
//====================

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//==============
// Routes
//==============
// Main Root
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
  .then(function (dbContent) {
    if(dbContent.length > 0 ) {
      console.log("Scrapping up to date!");

    } else {
      request("https://www.sfchronicle.com/local/bayarea/", function (err, res, body) {
        if (err) {
          console.log("Error found: ", err);

        } else {
          var $ = cheerio.load(body);

          $(".prem-hl-item").each(function (i, element) {
            // Empty string where scrapped articles will go 
            var articleInfo = {};

            articleInfo.title = $(this)
            .children(".headline")
            .children("a")
            .text()

            articleInfo.summary = $(this)
            .children(".blurb")
            .text()

            articleInfo.url = "https://www.sfchronicle.com/local/bayarea/" + $(this)
            .children(".headline")
            .children("a")
            .attr("href");

            db.Article.create(articleInfo)
            .then(function (dbArticle) {
              
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

// Route to delete all articles && notes from database

app.get("/deleteArticles", function (req, res) {
  db.Article.deleteMany({})
  .then(function (result) {
    console.log("Articles have been deleted!");
    res.json(result);
  })
  .catch(function (err) {
    console.log(err);
  })

  db.Note.deleteMany({})
  .then(function (result) {
     console.log("Notes have been deleted!");
     res.json(result);
  })
  .catch(function (err) {
     console.log(err);
  })


})

// Route for updating saved articles
app.put("/saveArticle/:id", function(req, res) {

  db.Article.findOneAndUpdate({ _id: req.params.id }, {$set: { saved: true } })
  .then(function (dbArticle) {
    res.json(dbArticle);
  })
  .catch(function (err) {
    console.log(err);
  })

})

// Route for all saved articles

app.get("/savedArticles", function (req, res) {
  db.Article.find({saved: true})
  .then(function(dbArticles) {

    var articles = { 
      articles: dbArticles
    }
    res.render("saved", articles);
  })
  .catch(function (err) {
    console.log(err);
  })

})
// Route for unsaved articles
app.put("/unsaveArticle/:id", function (req, res) {

  db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: false } })
     .then(function (dbArticle) {
        res.json(dbArticle);
     })
     .catch(function (err) {
        console.log(err);
     })

})

// Route to create a new note
app.post("/newNote/:id", function (req, res) {
  console.log(req.params.id);
  console.log(req.body);
db.Note.create(req.body)
.then(function (dbNote) {
  return db.Article.findOneAndUpdate({_id: req.params.id }, {$push: { notes: dbNote._id }}, { new: true });

})
.then(function (dbArticle) {

  res.json(dbArticle);
})
.catch(function (err) {
  res.json(err);
});

})

// Route to update the note of a certain article
app.get("/article/:id/notes", function (req, res) {
  console.log(req.params.id);

  db.Article.findOne({ _id: req.params.id })
  .populate("notes")
  .then(function (dbArticle) {
    res.json(dbArticle);
  })
  .catch(function (err) {
    res.json(err);
  })
})


//==============
  // Server
//==============
  app.listen(PORT, function () {
    console.log("Running on port: " + PORT);
  });