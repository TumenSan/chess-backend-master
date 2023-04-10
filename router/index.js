const Router = require("express").Router;
const userController = require("../controllers/userController");
const gameController = require("../controllers/gameController");
const router = new Router();
const { body } = require("express-validator");
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  "/registration",
  body("password").isLength({ min: 3, max: 32 }),
  userController.registration
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/savegame", gameController.sendSaveGame); //
router.post("/sendgame", gameController.sendGame); //
router.get("/games", gameController.getGames); //
router.post("/sendposition", gameController.sendPosition); //
//router.post("/estimation", userController.estimation); //
router.get("/refresh", userController.refresh);
router.get("/users", authMiddleware, userController.getUsers);

module.exports = router;
