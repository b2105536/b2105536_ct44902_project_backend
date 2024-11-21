const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

//Create and Save a new Book
exports.create = async (req, res, next) => {
    const { MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, TacGia } = req.body;
    
    if (!MaSach || !TenSach || !DonGia || !SoQuyen || !NamXuatBan || !MaNXB || !TacGia) {
        return next(new ApiError(400, "All fields are required"));
    }

    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.create(req.body);
        return res.send(document);
    } catch (error) {
        if (error.message.includes("Publisher does not exist")) {
            return next(new ApiError(400, "Publisher does not exist"));
        }
        return next(
            new ApiError(500, "An error occurred while creating the book")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const bookService = new BookService(MongoDB.client);
        const { TenSach } = req.query;
        if (TenSach) {
            documents = await bookService.findByName(TenSach);
        } else {
            documents = await bookService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving books")
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.findByMaSach(req.params.masach);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving book with MaSach=${req.params.masach}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.update(req.params.masach, req.body);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was updated successfully" });
    } catch (error) {
        if (error.message === "MaSach already exists") {
            return next(new ApiError(400, "MaSach already exists"));
        }
        return next(
            new ApiError(500, `Error updating book with MaSach=${req.params.masach}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.delete(req.params.masach);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete book with MaSach=${req.params.masach}`
            )
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const deletedCount = await bookService.deleteAll();
        return res.send({
            message: `${deletedCount} books were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all books")
        );
    }
};

exports.findAllFavorite = async (_req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const documents = await bookService.findFavorite();
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(
                500,
                "An error occurred while retrieving favorite books"
            )
        );
    }
};