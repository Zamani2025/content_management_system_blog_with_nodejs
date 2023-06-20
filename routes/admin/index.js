const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../models/Post');
const {userAuthenticated} = require('../../helpers/authentication');


router.all("/*", (req, res, next) => {
    req.app.locals.layout = "admin",
    next();
});

router.get('/', userAuthenticated, (req, res) => {
    res.render('admin/index', {
        method: "Admin Page"
    });
});

router.post('/generate', (req, res) => {
    for(let i = 0; i <= req.body.amount; i ++){
        let post = new Post();
        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.sentences();

        post.save().then(savedPost => {});
        
        res.redirect('/admin/posts');
    }
});

module.exports = router;