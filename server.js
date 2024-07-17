require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const router = require("./router/userRouter");
require("./config/dataBase");

const port = process.env.PORT;

const app = express();
app.use(express.json());

app.use('/api/v1', router);
app.use((err, req, res, next) => {
    if(err instanceof multer.MulterError) {
        return res.status(400).json(err.message)
    } else if(err) {
        return res.status(400).json({error: err.message})
    }
});

app.listen(port, () => {
    console.log(`Server is running on ${port}.`)
});