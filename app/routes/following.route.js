const express = require("express");
const following = require("../controllers/following.controller");

const router = express.Router();

router.route("/")
    .get(following.findAll)
    .post(following.create)
    .delete(following.deleteAll);

router.route("/:identifier")
    .get(following.findOne)
    .put(following.update)
    .delete(following.delete);

module.exports = router;