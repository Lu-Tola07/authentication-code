require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const URL = process.env.DATABASE;

mongoose.connect(URL).then(() => {
    console.log(`Successfully connected to the Database.`)
}).catch((err) => {
    console.log(`Error connecting to the Database.`, err.message)
});