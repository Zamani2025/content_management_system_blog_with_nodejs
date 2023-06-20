const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const exphbs = require('express-handlebars').engine;
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDb = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const passport = require('passport');

dotenv.config();

connectDb();

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

const {select, generateDate} = require('./helpers/handlebars');

app.engine('.hbs', exphbs({defaultLayout: 'home', extname: '.hbs', helpers: ({select: select, generateDate: generateDate})}));
app.set('view engine', '.hbs');


app.use(express.static(path.join(__dirname, '/public')));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.use(methodOverride('method'));

app.use(upload());

app.use(session({
    secret: "keyBoard",
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.errors = req.flash('errors');
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.danger = req.flash('danger');
    next();
});



app.use('/', require('./routes/home/index'));
app.use('/admin', require('./routes/admin/index'));
app.use('/admin/posts', require('./routes/admin/posts'));
app.use('/admin/categories', require('./routes/admin/categories'));
app.use('/admin/comments', require('./routes/admin/comments'));


app.listen(port, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}!`))