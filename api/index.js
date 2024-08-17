const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User') // user database 
const Post = require('./models/Post') // posts database
const bcrypt = require('bcryptjs'); // to encrypt password
const app = express();
const jwt = require('jsonwebtoken'); // used to ______
const cookieParser = require('cookie-parser');
const multer = require('multer'); // used to upload file
const uploadMiddleware = multer({ dest: 'uploads/'});
const fs = require('fs'); // rename file

const salt = bcrypt.genSaltSync(10); // for registering
const secret = 'asdkjfahs24kjow3w3yreury2ekrjsghlr'; // for jwt (login)

// MIDDLEWARE

// allows server to be accessible by other origins (browser domains)
// also saves cookie as credentials
app.use(cors({credentials: true, origin:'http://localhost:3000'})); 

app.use(express.json()); // parse incoming requests with json payload
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads')); // to add images to upload

// connect to mongoose database
mongoose.connect('mongodb+srv://blog:KX5hLzFSqjcVhuS2@cluster0.7zxjwgi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

app.get('/', (request, response) => {
    response.send('Hello World');
});

// create API endpoint and function to handle registering action
app.post('/register', async (request, response) => {
    const {username, password} = request.body; // to get user input

    try{
        // create based on user schema
        const userDoc = await User.create({
            username, 
            password: bcrypt.hashSync(password, salt),
        }); 
        response.json(userDoc); // should show user, pass, and an id
    } catch(e) {
        response.status(400).json(e);
    }
})

// create API endpoint and function to handle logging in action
app.post('/login', async (request, response) => {
    const {username, password} = request.body;
    const userDoc = await User.findOne({username});

    // compare if login password is same as registered one
    // first arg is from request, second arg is from salt/encrypted pass
    const passOk = bcrypt.compareSync(password, userDoc.password); 

    if(passOk) { // user is logged in
        // use jwt to identify an authenticated user
        // sign with private key (secret)
        jwt.sign({username, id:userDoc._id}, secret, {}, (err, token) => {
            if(err) throw err;
            // token is a unique string
            // to send token every time we do a request, send as a cookie
            response.cookie('token', token).json({
                id: userDoc._id,
                username,
            }); 
        });
    } else {
        response.status(400).json('Wrong credentials.');
    }
});

// create an API endpoint to return profile info once user has logged in
app.get('/profile', (request, response) => {
    const {token} = request.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if(err) throw err;
        response.json(info);
    });
});

// API endpoint to "cancel" token when logging out
app.post('/logout', (request, response) => {
    response.cookie('token', '').json('ok');
});

// upload file and create Post model in database
app.post('/post', uploadMiddleware.single('file'), async (request, response) => {
    // upload file
    const {originalname, path} = request.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1]; // .png, .jpeg, etc
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);

    const {token} = request.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if(err) throw err;

        // create post
        const {title, summary, content} = request.body;
        const postDoc = await Post.create({
            title, 
            summary, 
            content,
            cover: newPath,
            author: info.id, // reference to user who is logged in
        });

        response.json(postDoc);
    });
});

// to display all posts on homepage(?)
app.get('/post', async (request, response) => {
    response.json(
        await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1}) // descending order (most recent)
        .limit(20)
    );
});

// for a single post page
app.get('/post/:id', async (request, response) => {
    const {id} = request.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    response.json(postDoc);
});

// PUT to update post
// app.put('/post', uploadMiddleware.single('file'), async (request, response) => {
//     let newPath = null;
//     if(request.file) {
//         const {originalname, path} = request.file;
//         const parts = originalname.split('.');
//         const ext = parts[parts.length - 1]; // .png, .jpeg, etc
//         newPath = path+'.'+ext;
//         fs.renameSync(path, newPath);
//     }

//     const {token} = request.cookies;
//     jwt.verify(token, secret, {}, async (err, info) => {
//         if(err) throw err;
//         const {id, title, summary, content} = request.body;
//         const postDoc = await Post.findById(id);
        
//         const isAuthor  = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
//         if (!isAuthor) {
//             return response.status(400).json('You cannot edit. You are not the author.')
//         }
        
//         await postDoc.update({
//             title, 
//             summary, 
//             content,
//             cover: newPath ? newPath : postDoc.cover,
//         });

//         response.json(postDoc);
//     });
// });

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1]; // .png, .jpeg, etc
        newPath = `${path}.${ext}`;
        try {
            fs.renameSync(path, newPath);
        } catch (error) {
            return res.status(500).json({ error: 'Error renaming the file' });
        }
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(401).json({ error: 'Token verification failed' });
        }

        const { id, title, summary, content } = req.body;
        let postDoc;
        try {
            postDoc = await Post.findById(id);
            if (!postDoc) {
                return res.status(404).json({ error: 'Post not found' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Error finding the post' });
        }

        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(403).json({ error: 'You cannot edit. You are not the author.' });
        }

        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        if (newPath) {
            postDoc.cover = newPath;
        }

        try {
            await postDoc.save();
        } catch (error) {
            return res.status(500).json({ error: 'Error updating the post' });
        }

        res.json(postDoc);
    });
});

app.delete('/post/:id', async (request, response) => {
    const {token} = request.cookies;
    const {id} = request.params;

    jwt.verify(token, secret, {}, async (err, info) => {
        if(err) {
            return response.status(401).json({error: 'Token verification failed'});
        }

        try {
            const postDoc = await Post.findById(id);
            if(!postDoc) {
                return response.status(404).json({error: 'Post not found'});
            }

            const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
            if(!isAuthor) {
                return response.status(403).json({error: "You are not authorized to delete this post"});
            }

            await Post.findByIdAndDelete(id);
            response.json({message: 'Post deleted successfully'});
        } catch (error) {
            response.status(500).json({error: 'Error deleting post'});
        }
    });
});

app.listen(4000);

// KX5hLzFSqjcVhuS2

// npm install mongodb
// mongodb+srv://blog:KX5hLzFSqjcVhuS2@cluster0.7zxjwgi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0