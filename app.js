const express = require("express");
const cors = require("cors");
const booksRouter = require("./app/routes/book.route");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Chào mừng bạn đến với hệ thống quản lý mượn sách." });
});

app.use("/api/books", booksRouter);

module.exports = app;