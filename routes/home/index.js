const express = require('express');
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const router = express.Router();
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');


router.all("/*", (req, res, next) => {
    req.app.locals.layout = "home",
    next();
});

router.get('/', (req, res) => {
    Post.find({}).lean().then(posts => {
        Category.find({}).lean().then(categories => {
            res.render('home/index', {
                method: 'Home Page',
                posts: posts,
                categories: categories
            });
        });
    });
});

router.get('/posts/:id', (req, res) => {
    Post.findOne({_id: req.params.id})
    .populate({path: 'comments', populate: {path: 'user', model: 'users'}})
    .populate('user')
    .lean()
    .then(posts => {
        Category.find({}).lean().then(categories => {
            res.render('home/posts', {
                method: "Home | Post",
                posts: posts,
                categories: categories
            });
        });
    });
});

router.get('/login', (req, res) => {
    res.render('home/login', {
        method: "Home | Login Page"
    });
});

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) =>{
    User.findOne({email: email}).then(user => {
        if(!user){
            return done(null, false, {message: "Incorrect User Name"})
        }
        bcryptjs.compare(password, user.password, (err, Match) => {
            if(err){
                return err;
            }
            if(Match){
                return done(null, user)
            }else {
                return done(null, false, {message: "Incorrect Password"});
            }
        });
    });
}));
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        successFlash: true,
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

router.get('/register', (req, res) => {
    res.render('home/register', {
        method: "Home | Register Page"
    });
});

router.post('/register', (req, res) => {
    const errors = [];
    let email = req.body.email;
    if(!req.body.firstName){
        errors.push({message: "First Name field is required"})
    }
    if(!req.body.lastName){
        errors.push({message: "Last Name field is required"})
    }
    if(!req.body.email){
        errors.push({message: "Email field is required"})
    }
    if(!req.body.password){
        errors.push({message: "Password field is required"})
    }
    if(req.body.password !== req.body.passwordConfirm){
        errors.push({message: "Password fields dont match"})
    }

    if(errors.length > 0){
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
    }else {
        User.findOne({email: email}).then(user => {
            if(user){
                req.flash('danger', 'Email exists, please login');
                res.redirect('/login');
            }else {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                });

                newUser.save().then(savedUser => {
                    req.flash('success', 'You are now registered, please login');
                    res.redirect('/login');
                }).catch(error => {
                    console.log(error);
                });
            }
        });
    }
});

router.get('/about', (req, res) => {
    res.render('home/about', {
        method: "Home | About Page"
    });
});

module.exports = router;