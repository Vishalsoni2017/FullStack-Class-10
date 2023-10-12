const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const app = express();

const router = require('./router');

let sessionOptions = session({
    secret: "Js is cool",
    store: MongoStore.create({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*10, httpOnly: true}
})

app.use(sessionOptions)
app.use(flash())

app.use(function(req, res, next) {
    if(req.session.user){
        req.visitorId = req.session.user._id
    }else{
        req.visitorId = 0
    }
    res.locals.user = req.session.user
    next()
})

app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.set('view engine', 'ejs');

app.use('/', router)

module.exports = app;