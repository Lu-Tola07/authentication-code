require("dotenv").config();
const userModel = require("../model/userModel");
const sendMail = require("../helpers/email");
const html = require("../helpers/html")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const { link } = require("../router/userRouter");
const cloudinary = require("../helpers/cloudinary");
const fs = require("fs");
const path = require("path");
const {promisify} = require("util");

exports.createUser = async (req, res) => {
    try {
        const {firstName, lastName, email, passWord, phoneNumber} = req.body;

        const checkIfAnEmailExist = await userModel.findOne({email: email.toLowerCase()});
        if(checkIfAnEmailExist) {
            return res.status(400).json("User with this email already exists.")
        }

        const bcryptPassword = await bcrypt.genSaltSync(10);

        const hashedPassword = await bcrypt.hashSync(passWord, bcryptPassword);

        if(!req.file) {
            return res.status(400).json("Kindly upload your profile picture.")
        };

        const cloudProfile = await cloudinary.uploader.upload(req.file.path, {folder: "users dp"}, (err) => {
            if(err) {
                return res.status(400).json(err.message)
            }
        });
 
        const data = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            passWord: hashedPassword,
            phoneNumber,
            profilePicture: {
                pictureId: cloudProfile.public_id,
                pictureUrl: cloudProfile.secure_url
            }
        };
        // console.log("d")
        
        const createdUser = await userModel.create(data);

        await fs.unlink(req.file.path, (err) => {
            if(err) {
                return res.status(400).json("Unable to delete user's file.")
                console.log(err.message)
            } else {
                console.log(`File has been deleted successfully.`)
            }
        });

        const userToken = jwt.sign({id:createdUser._id, email:createdUser.email}, process.env.jwtSecret, {expiresIn: "3 minutes"});
        const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${createdUser._id}/${userToken}`;
            // console.log(req.protocol)
            // console.log("e")
        sendMail({
            subject: `Kindly verify your mail.`,
            email: createdUser.email,
            html: html(verifyLink, createdUser.firstName)
            // message: `Welcome ${createdUser.firstName} ${createdUser.lastName}, kindly click on the button to verify your account. ${verifyLink}`
        });
        // console.log("a")
        
        res.status(201).json({
           message: `Welcome ${createdUser.firstName}, kindly check your gmail to access the link to verify your email.`,
           data: createdUser 
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        // console.log("b")
    }
};
// console.log("c")

// try {
//     const { firstName, lastName, email, passWord, phoneNumber } = req.body;

//     // Check if the email already exists in the database
//     const checkIfAnEmailExist = await userModel.findOne({ email: email.toLowerCase() });
//     if (checkIfAnEmailExist) {
//         return res.status(400).json("User with this email already exists.");
//     }

//     // Generate hashed password
//     const bcryptPassword = await bcrypt.genSaltSync(10);
//     const hashedPassword = await bcrypt.hashSync(passWord, bcryptPassword);

//     // Upload profile picture to Cloudinary
//     const cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "users dp" });

//     // Create user data object
//     const data = {
//         firstName,
//         lastName,
//         email: email.toLowerCase(),
//         passWord: hashedPassword,
//         phoneNumber,
//         profilePicture: {
//             pictureId: cloudProfile.public_id,
//             pictureUrl: cloudProfile.secure_url
//         }
//     };

//     // Create user in database
//     const createdUser = await userModel.create(data);

//     // Generate JWT token for user
//     const userToken = jwt.sign({ id: createdUser._id, email: createdUser.email }, process.env.jwtSecret, { expiresIn: "3 minutes" });

//     // Construct verification link
//     const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${createdUser._id}/${userToken}`;

//     // Send verification email with HTML content
//     sendMail({
//         subject: `Kindly verify your email.`,
//         email: createdUser.email,
//         html: html(verifyLink, createdUser.firstName)
//     });

//     // Respond with success message and created user data including token
//     res.status(201).json({
//         message: `Welcome ${createdUser.firstName}, please check your email (${createdUser.email}) to verify your email address.`,
//         data: {
//             user: createdUser,
//             token: userToken
//         }
//     });

// } catch (error) {
//     // Handle errors
//     res.status(500).json({
//         message: error.message
//     });
// }
// };


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
            id: findWithEmail._id, isAdmin: findWithEmail.isAdmin, isSuperAdmin: findWithEmail.isSuperAdmin},
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

// exports.updatePicture = async (req, res) => {
//     try {
//         const userToken = req.headers.authorization.split(" ")[1];
//         const userId = userToken.id;
//         if(!req.file) {
//             return res.status(400).json("No profile picture selected.")
//         };

//         await jwt.verify(userToken, process.env.jwtSecret, async (err, newUser) => {
//             if(err) {
//                 return res.status(400).json("Unable to authenticate.")
//             } else {
//                 req.user = newUser.id

//                 const cloudImage = await cloudinary.uploader.upload(req.file.path,
//                     {folder: "User's dp"}, (err, data) => {
//                     if(err) {
//                         return res.status(400).json(err.message)
//                     }
//                 return data
//             });

//             const userId = newUser.id;
//             // console.log(userId);

//             const pictureUpdate = {profilePicture:{pictureId: cloudImage.public_id,
//                 pictureUrl: cloudImage.secure_url}};

//             const user = await userModel.findById(userId);
//             const formerImageid = user.profilePicture.pictureId;
//             await cloudinary.uploader.destroy(formerImageid);
            
//             const checkUser = await userModel.findByIdAndUpdate(userId, pictureUpdate, {new: true});
//             await fs.unlink(req.file.path, (err) => {
//                 if(err) {
//                     return res.status(400).json("Unable to delete user's file.")
//                     console.log(err.message)
//                 } else {
//                     console.log(`Updated file deleted successfully.`)
//                 }
//             });

//         return res.status(200).json("User image has been changed successfully.");
//         }})

//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         }) 
//     }
// };

// exports.createMultiplePictures = async (req, res) => {
//     try {
//         const {userId} = req.body;
//         // Ensure the request contains files
//         if(!req.files || req.files.length === 0) {
//             return res.status(400).json("No files uploaded.")
//         };
//         // Store the uploaded files
//         const uploadedPictures = [];
//         for (const file of req.files) {
//             const result = await cloudinary.uploader.upload_stream({folder: 'usersPictures'}, (err, result) => {
//                 if (err) {
//                     throw new Error(error.message)
//                 }
//                 return result
//             }).end(file.buffer)

//             uploadedPictures.push({
//                 pictureId: result.public_id,
//                 pictureUrl: result.secure_url
//             })
//         };
//         // Save picture data to your database
//         const createdPictures = await pictureModel.create({
//             userId,
//             pictures: uploadedPictures
//         });

//         await fs.unlink(req.file.path, (err) => {
//             if(err) {
//                 return res.status(400).json("Unable to delete user's files.")
//                 console.log(err.message)
//             } else {
//                 console.log(`Files successfully deleted.`)
//             }
//         });

//         res.status(201).json({
//             message: "Pictures uploaded successfully.",
//             data: createdPictures
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };

// 2nd Trial
// exports.updatePicture = async (req, res) => {
//     try {
//         // Extract token from headers
//         const userToken = req.headers.authorization.split(" ")[1];

//         // Check if file is provided
//         if (!req.file) {
//             return res.status(400).json({ message: "No profile picture selected" });
//         }

//         // Verify token
//         jwt.verify(userToken, process.env.jwtSecret, async (error, newUser) => {
//             if (error) {
//                 return res.status(400).json({ message: "Could not authenticate" });
//             } else {
//                 const userId = newUser.id;

//                 // Find user to get the current profile picture
//                 const user = await userModel.findById(userId);
//                 if (!user) {
//                     return res.status(404).json({ message: "User not found" });
//                 }

//                 // Save the current profile picture details
//                 const formerImage = {
//                     pictureId: user.profilePicture.pictureId,
//                     pictureUrl: user.profilePicture.pictureUrl
//                 };

//                 // Upload new profile picture to Cloudinary
//                 const cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "users_dp" },{new:true});

//                 // Prepare update data
//                 const pictureUpdate = {
//                     profilePicture: {
//                         pictureId: cloudProfile.public_id,
//                         pictureUrl: cloudProfile.secure_url,
//                         formerImages: [...user.profilePicture.formerImages, formerImage] // Save old picture details
//                     }
//                 };

//                 // Update user profile picture
//                 const updatedUser = await userModel.findByIdAndUpdate(userId, pictureUpdate, { new: true });

//                 //delete the picture from media folder
//                 fileSystem.unlink(req.file.path,(error)=>{
//                     if(error){
//                         return res.status(400).json({
//                             message:"unable to delete users profile picture",error
//                         })            
//                     }
//                 });

//                 // Return success response
//                 return res.status(200).json({
//                     message: "User image successfully changed",
//                     data: updatedUser.profilePicture
//                 });
//             }
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };


exports.updatePicture = async (req, res) => {
    try {
      const userToken = req.headers.authorization.split(" ").pop();
  
      if(!req.file || !req.file.path) {
        return res.status(400).json({
            error: "Picture has not been provided."
        })
      };
      
      const verifyToken = promisify(jwt.verify);
      
      let newUser;
      try {
        newUser = await verifyToken(userToken, process.env.jwtSecret);
      } catch (err) {
        return res.status(400).json({
            error: err.message
        })
      };
  
      const userId = newUser.id;
      
      try {
        const cloudImage = await cloudinary.uploader.upload(req.file.path,{folder: "updatedDp"});
        const user = await userModel.findById(userId);

        if(!user) {
            return res.status(404).json({
                error: "User not found."
            })
        };
  
        if(user.profilePicture && user.profilePicture.pictureUrl) {
            if(!user.previousProfilePictures) {
                user.previousProfilePictures = []
            }
            user.previousProfilePictures.push(user.profilePicture.pictureUrl)
        };
  
        user.profilePicture = {
          pictureId: cloudImage.public_id,
          pictureUrl: cloudImage.secure_url,
        };

        fs.unlink(req.file.path, (err) => {
          if(err) {
            console.log(err.message)
        } else {
            ("Delete has been successful.")
        }
    });
    
        const updatedUser = await user.save();

        const userName = newUser.firstName || "User";

        return res.status(200).json({
            message: `${userName}'s profile picture has been updated.`,
            updatedUser
        })
    
        } catch (uploadError) {
            return res.status(400).json({
                error: uploadError.message
            })
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
  };
