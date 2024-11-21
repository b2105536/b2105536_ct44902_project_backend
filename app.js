const express = require("express");
const cors = require("cors");
const booksRouter = require("./app/routes/book.route");
const librariansRouter = require("./app/routes/librarian.route");
const readersRouter = require("./app/routes/reader.route");
const publishersRouter = require("./app/routes/publisher.route");
const followingRouter = require("./app/routes/following.route");
const ApiError = require("./app/api-error");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Library Circulation Management System." });
});

app.use("/api/books", booksRouter);
app.use("/api/librarians", librariansRouter);
app.use("/api/readers", readersRouter);
app.use("/api/publishers", publishersRouter);
app.use("/api/following", followingRouter);


app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;