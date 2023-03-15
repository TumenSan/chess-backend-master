const Router = require("express").Router;
const userController = require("../controllers/userController");
const router = new Router();
const { body } = require("express-validator");
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  "/registration",
  body("password").isLength({ min: 3, max: 32 }),
  userController.registration
);
router.post("/login", userController.login);
router.post("/giveup", userController.giveup); //
router.post("/logout", userController.logout);
router.get("/refresh", userController.refresh);
router.get("/users", authMiddleware, userController.getUsers);

module.exports = router;
