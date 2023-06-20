const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');


router.all("/*",userAuthenticated, (req, res, next) => {
    req.app.locals.layout = "admin",
    next();
});

router.get('/', (req, res) => {
    Category.find({}).lean().then(categories => {    
        res.render('admin/categories', {
            method: "Admin | Categories",
            categories: categories
        });
    })
});

router.post('/', (req, res) => {
    let name = req.body.name
    Category.findOne({name: name}).then(categories => {
        if(categories){
            req.flash('danger', 'Category Title exist, choose another');
            res.redirect('/admin/categories');
        }else {
            const newCategory = new Category({
                name: name,
                slug: name
            });

            newCategory.save().then(savedCategory => {
                req.flash('success', `${savedCategory.name} successfully saved`);
                res.redirect('/admin/categories');
            }).catch(error => {
                console.log(error);
            });
        }
    });
});

router.get('/edit-category/:slug', (req, res) => {
    Category.findOne({slug: req.params.slug}).lean().then(categories => {
        res.render('admin/categories/edit_categories', {
            categories: categories,
            method: "Admin | Edit Category"
        });
    });
});

router.put('/edit-category/:slug', (req, res) => {
    Category.findOne({slug: req.params.slug}).then(categories => {
        categories.name = req.body.name;
        categories.slug = req.body.name

        categories.save().then(updateCategory => {
            req.flash('success', `${categories.name} successfully updated`);
            res.redirect('/admin/categories');
        }).catch(error => {
            console.log(error);
        });
    });
});

router.delete('/delete/:slug', (req, res) => {
    Category.findOneAndDelete({slug: req.params.slug}).then(results => {
        req.flash('success', 'Category successfully deleted');
        res.redirect('/admin/categories');
    });
});

module.exports = router;