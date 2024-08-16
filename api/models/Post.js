const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostSchema = new Schema ({
    title: String, 
    summary: String, 
    content: String,
    cover:String, // path to file in uploads/
    author: {type: Schema.Types.ObjectId, ref: 'User'}, // save author (id) info
}, {
    timestamps: true, // for time created at 
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;