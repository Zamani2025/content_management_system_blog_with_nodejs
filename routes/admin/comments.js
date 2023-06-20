const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');


router.all("/*", (req, res, next) => {
    req.app.locals.layout = "admin",
    next();
});

router.get('/', (req, res) => {
    Comment.find({user: req.user.id}).populate('user').lean().then(comments => {
        res.render('admin/comments', {
            method: "Admin | Comments",
            comments: comments
        });
    })
});

router.post('/', (req, res) => {
    Post.findOne({_id: req.body.id}).then(posts => {

        const newComment = new Comment({
            user: req.user._id,
            body: req.body.body
        });

        posts.comments.push(newComment);
        posts.save().then(savedPost => {
            newComment.save().then(savedComment => {

                req.flash('success', 'Comments saved');
                res.redirect(`/posts/${posts.id}`);
            });
        });
    })
});

router.delete('/', (req, res) => {
    Comment.findOneAndDelete({_id: req.params.id}).then(results => {
        
        Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data) => {
            if(err) console.log(err);
    
            req.flash('success', 'Comments successfully Deleted');
            res.redirect('/admin/comments')
        })


    });
});

module.exports = router;