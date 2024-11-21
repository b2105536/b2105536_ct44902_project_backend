const express = require("express");
const librarians = require("../controllers/librarian.controller");

const router = express.Router();

router.route("/")
    .get(librarians.findAll)
    .post(librarians.create)
    .delete(librarians.deleteAll);

router.route("/:msnv")
    .get(librarians.findOne)
    .put(librarians.update)
    .delete(librarians.delete);

module.exports = router;