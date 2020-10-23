const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

const exjwt = require('express-jwt');
var axios = require('axios');

const bodyParser = require('body-parser');

const path = require('path');
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', 'http:/localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const PORT = 3000;

const secretKey= "My super secret key";

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256'],
    isRevoked: isRevokedCallback
});

var isRevokedCallback = function(req, payload, done){
    var issuer = payload.iss;
    var tokenId = payload.jti;
  
    data.getRevokedToken(issuer, tokenId, function(err, token){
      if (err) { return done(err); }
      return done(null, !!token);
    });
  };

let users=[
    {
        id:1,
        username : 'Amulya',
        password : '123'
    },
    {
        id : 2,
        username : 'Prodduturi',
        password : '456'
    }
];


app.post('/api/login',(req,res)=>{
    const {username,password} = req.body; 

    for(let user of users)
    {
        if(username == user.username && password == user.password)
        {
          let token = jwt.sign({id : user.id,username: user.username },secretKey, {expiresIn :60*3});
            res.json({
                success: true,
                err:null,
                token
            });
            break;
        }   
    }

    res.status(401).json({
        success:false,
        token:null,
        err: 'Username or Password is incorrect'
    });
}); 

app.get('/api/dashboard', jwtMW, (req,res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see',
    });
});

app.get('/api/settings',jwtMW, (req,res) =>{
    res.json({
        success : true,
        myContent: "Only the authorized person can access this settings page."
    });
});

app.get('/api/prices', jwtMW, (req,res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'This is the price $4.00 !!!',
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {

    if(err.name === 'UnauthorizedError') {
      if(err.inner.name == 'TokenExpiredError') {
          console.log(err.inner.name);
          axios.get('http://localhost:3000');
          return;
        }
        res.status(401).json({
                success: false,
                officialError: err,
                err: 'Username or password is incorrect 2'
        });
    } else {
        next(err);
    }
  });

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
