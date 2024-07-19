const router = require("express").Router();
const { createUser, verifyEmail, newEmail, logIn, updateUser, makeAdmin, updatePicture } = require("../controller/userController");
const { authenticator } = require("../helpers/authentication");
const { authorize, authorizeSuper } = require("../helpers/authorization");
const uploader = require("../helpers/multer");

router.post("/user", uploader.single("profilePicture"), createUser);
// router.post("/upload-pictures", upload.array("pictures"), createMultiplePictures);

router.get("/verify/:id/:token", verifyEmail);

router.get("/newLink/:id", newEmail);

router.post("/login", logIn);

router.get("/", authenticator, (req, res) => {
    res.status(200).json(`Welcome to my homepage ${req.user}.`)
});

router.patch("/update/:id", authorize, updateUser);
router.put("/update/:id", authorizeSuper, makeAdmin);
router.put("/changeDp", authenticator, uploader.single("profilePicture"), updatePicture);

module.exports = router;