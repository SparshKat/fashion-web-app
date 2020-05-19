const express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose"),
    passport = require("passport") , 
    LocalStrategy   = require("passport-local") ,
    User = require('./models/user')
    app = express();

var port = process.env.PORT || 3000;
const mongoURL = "mongodb://localhost:27017/pretVA"
mongoose.connect(mongoURL, { useUnifiedTopology: true , useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine' , 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(require("express-session")({
    secret : "Batman" , 
    resave : false ,
    saveUninitialized : false 
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const isLoggedIn = (req,res,next)=> {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}


//AUTH ROUTES
app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register' , (req,res)=>{
    var newUser = new User(
        {
            username: req.body.username,
            email : req.body.email,
            name : req.body.name,
            phone : req.body.phone,
        }
    )
    console.log(newUser);
    User.register(newUser , req.body.password)
    .then(user => {
        passport.authenticate('local')(req,res,()=>{
            console.log(user);
            res.render('profilePage' ,{user : req.user} )
        })
        // res.send('SUCCESFULL');
    })
    .catch(err => {
        console.log(err);
        res.render('register');
    })
})

app.get('/profile',isLoggedIn , (req,res)=>{
    res.render('profilePage' ,{user : req.user} )
})

app.get('/login' , (req,res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local' , {
    successRedirect : '/profile',
    failureRedirect : '/login'
}) , (req,res) => {
    // res.render('login');
})

app.get('/', (req, res) => {
    res.redirect('/profile');
})


app.listen(port, () => {
    console.log("Server has started at " + port);
})