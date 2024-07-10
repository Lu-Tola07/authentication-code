require("dotenv").config();
const userModel = require("../model/userModel");
const sendMail = require("../helpers/email");
const html = require("../helpers/html")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const { link } = require("../router/userRouter");

exports.createUser = async (req, res) => {
    try {
        const {firstName, lastName, email, passWord, phoneNumber} = req.body;

        const checkIfAnEmailExist = await userModel.findOne({email: email.toLowerCase()});
        if(checkIfAnEmailExist) {
            return res.status(400).json("User with this email already exists.")
        }

        const bcryptPassword = await bcrypt.genSaltSync(10);

        const hashedPassword = await bcrypt.hashSync(passWord, bcryptPassword);

        const data = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            passWord: hashedPassword,
            phoneNumber};

        const createdUser = await userModel.create(data);
        const userToken = jwt.sign({id:createdUser._id, email:createdUser.email}, process.env.jwtSecret, {expiresIn: "3 minutes"});
        const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${createdUser._id}/${userToken}`;
            // console.log(req.protocol)
        sendMail({
            subject: `Kindly verify your mail.`,
            email: createdUser.email,
            html: html(verifyLink, createdUser.firstName)
            // message: `Welcome ${createdUser.firstName} ${createdUser.lastName}, kindly click on the button to verify your account. ${verifyLink}`
        });
        
        res.status(201).json({
           message: `Welcome ${createdUser.firstName}, kindly check your gmail to access the link to verify your email.`,
           data: createdUser 
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};


// Create an endpoint to verify User email
exports.verifyEmail = async (req, res) => {
    try {
        const Id = req.params.id
        const findUser = await userModel.findById(Id);

        jwt.verify(req.params.token, process.env.jwtSecret, (err) => {
            if(err) {

                const link = `${req.protocol}://${req.get("host")}/api/v1/newLink/${verify._id}`;
                sendMail({
                    subject: `Kindly verify your mail.`,
                    email: findUser.email,
                    html: html(link, findUser.firstName)
                    // message: `Welcome ${createdUser.firstName} ${createdUser.lastName}, kindly click on the button to verify your account. ${verifyLink}`
                });
                // return res.status(400).json(`This link has expired, kindly check your mail for a new link.`).redirect(link)

            } else {
                if(findUser.isVerified == true) {
                    return res.status(400).json(`Your account has already been verified.`)
                };

                userModel.findByIdAndUpdate(Id, {isVerified: true});
        
                res.status(200).json({
                    message: `You have been verified, kindly go ahead and log in.`})
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    };
};

exports.newEmail = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        const userToken = jwt.sign({id:createdUser._id, email:createdUser.email}, process.env.jwtSecret, {expiresIn: "3 minutes"});
        const reverifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${user._id}/${userToken}`;
        const link = sendMail({
            subject: `Kindly re-verify your mail.`,
            email: user.email,
            html: html(reverifyLink, user.firstName)
            // message: `Welcome ${createdUser.firstName} ${createdUser.lastName}, kindly click on the button to verify your account. ${verifyLink}`
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })  
    }
};

exports.logIn = async (req, res) => {
    try {
        
        const {email, passWord} = req.body;

        const findWithEmail = await userModel.findOne({email: email.toLowerCase()});

        if(!findWithEmail) {
            return res.status(404).json({
                message: `User with the email ${email} does not exist.`
            })
        }

        // const bcryptPassword = findWithEmail.passWord;
        const checkPassword = await bcrypt.compare(passWord, findWithEmail.passWord);

        if(!checkPassword) {
            return res.status(400).json({
                message: `Password incorrect.`
            })
        }

        const user = await jwt.sign({
            firstName: findWithEmail.firstName, isAdmin: findWithEmail.isAdmin, isSuperAdmin: findWithEmail.isSuperAdmin},
            process.env.jwtSecret,
            {expiresIn: "2 Minutes"});

        // const {firstName, lastName} = findWithEmail

        const {phoneNumber, isVerified, createdAt, updatedAt, __v, ...others} = findWithEmail._doc;

        res.status(200).json({
            message: `You have logged in successfully.`,
            data: others,
            token: user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })  
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const {firstName, lastName, phoneNumber} = req.body;
        const data = {
            firstName,
            lastName,
            phoneNumber
        }
        const user = await userModel.findOneAndUpdate(userId, data, {new: true});
        
        if(user) {
            return res.status(200).json({
                message: `This user has been updated.`,
                data: user
            })
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};


exports.makeAdmin = async (req, res) => {
    try {
        
        const newAdmin = await userModel.findByIdAndUpdate(req.params.id, {isAdmin: true});
        return res.status(200).json({
            message: `${newAdmin.firstName} is now an admin.`
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};