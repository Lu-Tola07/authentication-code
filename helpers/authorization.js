const jwt = require("jsonwebtoken");
require("dotenv").config();
const userModel = require("../model/userModel");

exports.authorize = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        // console.log(token)
        if(!token) {
            return res.status(400).json("Something went wrong, incorrect token.")
        }

        await jwt.verify(token, process.env.jwtSecret, (err, user) => {
            if(err) {
                return res.status(400).json("Kindly login to perform this action.")
            }

            req.user = user.firstName;
        })

        const checkUser = await userModel.findOne({firstName: req.user});
        // console.log(checkUser);
        if(checkUser.isAdmin == false || checkUser.isSuperAdmin == false) {
            res.status(401).json("You are not allowed to perform this action.")
        } else {
            next()
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.authorizeSuper = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        // console.log(token)
        if(!token) {
            return res.status(400).json("Something went wrong, incorrect token.")
        }

        await jwt.verify(token, process.env.jwtSecret, (err, user) => {
            if(err) {
                return res.status(400).json("Kindly login to perform this action.")
            }

            req.user = user.firstName;
        })

        const checkUser = await userModel.findOne({firstName: req.user});
        if(checkUser.isSuperAdmin == false) {
            res.status(401).json("You are not allowed to perform this action.")
        } else {
            next()
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};