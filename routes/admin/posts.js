const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const {isEmpty, uploadDir} = require('../../helpers/upload');
const fs = require('fs');
const path = require('path');
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');


router.all("/*", (req, res, next) => {
    req.app.locals.layout = "admin",
    next();
});

router.get('/', userAuthenticated, (req, res) => {
    Post.find({}).populate('category').lean().then(posts => {
        res.render('admin/posts', {
            method: "Admin | All Posts",
            posts: posts
        });
    })
});

router.get('/create', (req, res) => {
    Category.find({}).lean().then(categories => {
        res.render('admin/posts/create', {
            method: "Admin | Create Post",
            categories: categories
        });
    });
});

router.post('/create', (req, res) => {
    const errors = [];
    let filename = "";
    if(!req.body.title){
        errors.push({message: 'Title Field Is Required'})
    }
    if(!req.body.body){
        errors.push({message: 'Description Field Is Required'})
    }

    if(!isEmpty(req.files)){       
        let file = req.files.file;
        filename = Date.now() + "-" + file.name;
        file.mv('./public/upload/' + filename, (err) => {
            if(err){
                return err;
            }
        });

    }

    if(errors.length > 0){
        res.render('admin/posts/create', {
            errors: errors
        });
    }else {
        var allowComments = true;
        if(req.body.allowComments){
            allowComments = true;
        }else {
            allowComments = false;
        }
        var newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            file: filename,
            category: req.body.category
        });
        newPost.save().then(savedPost => {
            req.flash('success', `${savedPost.title} successfully saved`);
            res.redirect('/admin/posts');
        }).catch(error => {
            console.log(`Could not saved post ${error}`)
        });
    }
});

router.get('/edit-post/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).lean().then(posts => {
        Category.find({}).lean().then(categories => {
            res.render('admin/posts/edit_post', {
                posts: posts,
                method: "Admin | Edit Post",
                categories: categories
            });
        });
    });
});

router.put('/edit-post/:id', (req, res) => {
    var allowComments = true;
    if(req.body.allowComments){
        allowComments = true
    }else {
        allowComments = false;
    }
    let filename = "";
          
    if(!isEmpty(req.files)){       
        let file = req.files.file;
        filename = Date.now() + "-" + file.name;
        file.mv('./public/upload/' + filename, (err) => {
            if(err){
                return err;
            }
        });

    }
    Post.findOne({_id: req.params.id}).then(posts => {
        posts.title = req.body.title;
        posts.status = req.body.status;
        posts.allowComments = allowComments;
        posts.body = req.body.body;
        posts.file = filename,
        posts.category = req.body.category;
        posts.user = req.user.id,
  

        posts.save().then(updatePost => {
            req.flash('success', `${posts.title} updated successfully`);
            res.redirect('/admin/posts');
        }).catch(error => {
            console.log(`Could not update post ${error}`);
        });
    });
});

router.delete('/delete/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).populate('comments').then(post => {
        fs.unlink(uploadDir + post.file, (err) => {

            if(!post.comments.length < 1){
                post.comments.forEach(comment => {
                    comment.remove();
                });
            }


            post.remove();
            req.flash('success', `${post.title} successfully deleted`);
            res.redirect('/admin/posts');
        });
    });
});

module.exports = router;