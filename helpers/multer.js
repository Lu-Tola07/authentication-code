const multer = require("multer");

const path = require("path");


const storage = multer.diskStorage({

    destination: function(req, file, cb){
        console.log(file)
        cb(null, "./media")
    },
    filename: function(req, file, cb){
        const fileName = req.body.firstName;
        const fileExtension = file.originalname.split(".").pop();
        // console.log(fileExtension)
        cb(null, `${fileName}.${fileExtension}`)


        // const authHeader = req.headers.authorization;
        //     let token;
    
        //     if (authHeader) {
        //         token = authHeader.split(' ')[1];
        //     }     
        // // console.log(user)
        //     if(token){
        //         // const token=req.headers
        //         // console.log(token)
        //         const decodedToken = jwt.verify(token,process.env.jwtSecret);
        //         const user = decodedToken.firstName;
              
        //         console.log(user)
        //         const fileExtension = file.originalname.split('.').pop();
        //         console.log('b')
        //         cb(null, ${user}'s profile picture updated.${fileExtension}); 
    },
    // fileFilter: function(req, file, cb){
    //     if(file.mimetype != "image/jpg" || file.mimetype != "image/jpeg" || file.mimetype != "image/png"){
    //         return cb(new error())
    //     }
    //     if(file.size > 1024*1024){
    //         return cb(new error())
    //     } else {
    //         cb(null, true)
    //     }
    // }

});

const uploader = multer({
    storage,
    fileFilter: function(req, file, cb){
        const extension = path.extname(file.originalname)
        if(extension == ".jpg" || extension == ".jpeg" || extension == ".png") {
            cb(null, true)
        } else {
            cb(new Error("Unsupported format, kindly upload an image."))
        }
    },
    limits: {fileSize: 1024*1024*20}
});

module.exports = uploader;