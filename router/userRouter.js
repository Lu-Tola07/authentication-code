const router = require("express").Router();
const { createUser, verifyEmail, newEmail, logIn, updateUser, makeAdmin } = require("../controller/userController");
const { authenticator } = require("../helpers/authentication");
const { authorize, authorizeSuper } = require("../helpers/authorization");

router.post("/user", createUser);

router.get("/verify/:id/:token", verifyEmail);

router.get("/newLink/:id", newEmail);

router.post("/login", logIn);

router.get("/", authenticator, (req, res) => {
    res.status(200).json(`Welcome to my homepage ${req.user}.`)
});

router.patch("/update/:id", authorize, updateUser);
router.put("/update/:id", authorizeSuper, makeAdmin);

module.exports = router;