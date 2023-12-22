const express = require('express');
const morgan = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimit } = require('express-rate-limit');
const axios = require('axios');
const {PORT} = require('./config/serverConfig');
const app = express();

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	limit: 5, // Limit each IP to 5 requests per `window` (here, per 2 minutes).
})

app.use(morgan("combined"));
app.use(limiter);
app.use('/bookingService', async (req,res,next)=>{
    try {
        const response = await axios.get('http://localhost:3005/AuthService/api/v1/isAuthenticated',{
            headers:{ 'x-access-token': req.headers['x-access-token']}
        });
        if(response){
            next();
        }else{
            res.status(401).json({message : "unAuthenticated"});
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({message : "unAuthenticated"});
    }
})
app.use('/bookingService', createProxyMiddleware({target: "http://localhost:3002/", changeOrigin:true}));
app.use('/AuthService', createProxyMiddleware({target : "http://localhost:3001/", changeOrigin :true}));
app.get('/home', (req,res)=>{
    res.send("Received");
})
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})