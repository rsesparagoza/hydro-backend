const express  = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require ('dotenv').config();

const app = express();
const {PORT, mongoURI} = require('./keys');

require('./models/user');
require('./models/levels');
require('./models/updates');
require('./models/controls')

const requireToken = require('./middleware/requireToken');
const authRoutes = require('./routes/authRoutes');
app.use(bodyParser.json());
app.use(authRoutes);

mongoose.connect(mongoURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

mongoose.connection.on('connected',()=>{
    console.log("Connected to Mongo DB");
});

mongoose.connection.on('error',(err)=>{
    console.log("Error Connecting: ",err);
})


app.get('/',requireToken,(req,res)=>{
    res.send({email:req.user.email});
})

app.listen(process.env.PORT,()=>{
    console.log("Server running at port: " + PORT)
});

