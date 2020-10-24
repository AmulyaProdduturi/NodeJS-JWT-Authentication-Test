var express = require('express');
var app = express();

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt')
const bodyParser = require('body-parser');

const path = require('path');
var axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers','Content-type,Authorization');
    next();
})

const PORT = 3000;

const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret : secretKey,
    algorithms: ['HS256']
})



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
          let token = jwt.sign({id : user.id,username: user.username },secretKey, {expiresIn :180});
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

app.get('/api/dashboard',jwtMW, (req,res) =>{
    res.json({
        success : true,
        myContent: "Only logged in people can see"
    });
});

app.get('/api/settings',jwtMW, (req,res) =>{
    res.json({
        success : true,
        myContent: "Only the authorized person can access this settings page."
    });
});

app.get('/',(req,res) =>{
    res.sendFile(path.join(__dirname,'index.html'));
});

app.use(function(err,req,res,next){    
    if(err.name === 'UnauthorizedError'){
        // if(err.inner.name == "TokenExpiredError"){        
        //     axios.get('http://localhost:3000');
        //     return;
        // }
        res.status(401).json({
            success: false,
            officialError : err,
            err: 'Username or password is incorrect 2'
        });               
    }else{
        next(err);
    }
    
})


app.listen(PORT);