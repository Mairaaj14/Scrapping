// Dependencies
const express = require('express');
const router = express.Router();
const path = require('path');
const exphbs = require("express-handlebars");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Books and comments Models
const Books = require("./models/Books.js");
const Comments = require("./models/Comments.js");

// Tools for scrapping
var cheerio = require('cheerio');
var request = require('request');

// Scrape Route
app.get("/scrape", function(req, res) {
    //Make a request call to grab the HTML from the site of my choice
    request("https://www.publishersweekly.com/pw/by-topic/industry-news/bookselling/article/77459-the-bestselling-books-of-2018-so-far.html/", function(error, response, html) {

    var $ = cheerio.load(html);
    var result = {};
    // Look for the specified class
    $("col-xs-12").each(function(i, element) {
        // grab the link
        result.link = $(element).children().attr("href");
        result.title = $(element).children(".h4").text();

        // Use the Books Model to add new books
        var newBook = new Book(result);

        // Add the new book to the DB. This will give it a unique ID. 
        newBook.save(function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                console.log(doc);
            }
        });
        res.redirect('/')
    });
    });
    // Route to get all of the scrapped books
    app.get("/books", function (req, res) {
        Books.find({}, function (error, doc) {
            if (error) {
                console.log(error); 
            } else {
                res.json(doc);
            }
        });
    });
    // Get the books by book ID and populate with the comments
    app.get("/books/:id", function(req, res) {
        // Using the id prepare a query that finds the matching one in our database
        Books.findOne({ "_id": req.params.id})
        .populate("Comments")
        .exec(function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.json(doc);
            }
        });
    });
    app.post("/articles/:id", function(req, res) {
        // Create a new comment and pass the req body to the entry
        var newComment = new Comments(rea.body);
        // Save the comment to the db
        newComment.save(function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                Books.findOneAndUpdate({"_id": req.params.id }, {"Comments": doc._id })
                .exec(function(error, doc) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.send(doc);
                    }
                });
        }
    });
});
});
// Export router to server.js
module.exports = router;
