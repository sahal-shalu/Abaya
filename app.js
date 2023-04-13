require('dotenv').config()
const express = require('express')
const ejs=require('ejs')
const session = require('express-session')
const dbConnect=require('./config/dbConnect')
const morgan = require("morgan")

const userRouter = require('./routers/userRouter')
const adminRouter = require('./routers/adminRouters')



const app= express();
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dtevxccbm",
  api_key: "179654333255418",
  api_secret: "_2AEQkePyB2iFgSu1YsonwJ_kCk",
});

app.set('view engine','ejs')
dbConnect();
app.use(session({
    secret:'123',
    resave:false,
    saveUninitialized: true
}))

//app.use(morgan("dev"))

app.use(function(req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'))

app.use('/admin',adminRouter)
app.use('/',userRouter);



app.listen(1100,()=>{
    console.log('http://localhost:1100')
})