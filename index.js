const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors())

const path = require('path');
app.use(express.static('public'));
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public/index.html'));
})
app.listen(3000, ()=>console.log('listening at port 3000'))