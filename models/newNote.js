// Require mongoose
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    body: {
        type: String,
        required: true
    }
});

var Note = mongoose.model("newNote", NoteSchema);

module.exports = Note;
