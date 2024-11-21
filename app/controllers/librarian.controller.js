const LibrarianService = require("../services/librarian.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    const { MSNV, HoTenNV, Password, Chucvu, Diachi, SoDienThoai } = req.body;

    if (!MSNV || !HoTenNV || !Password || !Chucvu || !Diachi || !SoDienThoai) {
        return next(new ApiError(400, "All fields are required"));
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(SoDienThoai)) {
        return next(new ApiError(400, "Phone number is invalid"));
    }

   if (Password.length < 8) {
        return next(new ApiError(400, "Password must have at least 8 characters"));
    }

    try {
        const librarianService = new LibrarianService(MongoDB.client);
        const document = await librarianService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the information")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const librarianService = new LibrarianService(MongoDB.client);
        const { HoTenNV } = req.query;
        if (HoTenNV) {
            documents = await librarianService.findByName(HoTenNV);
        } else {
            documents = await librarianService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving librarians")
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const librarianService = new LibrarianService(MongoDB.client);
        const document = await librarianService.findByMSNV(req.params.msnv);
        if (!document) {
            return next(new ApiError(404, "Librarian not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving librarian with MSNV=${req.params.msnv}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const librarianService = new LibrarianService(MongoDB.client);
        const document = await librarianService.update(req.params.msnv, req.body);
        if (!document) {
            return next(new ApiError(404, "Librarian not found"));
        }
        return res.send({ message: "Librarian was updated successfully" });
    } catch (error) {
        if (error.message === "MSNV already exists") {
            return next(new ApiError(400, "MSNV already exists"));
        }
        return next(
            new ApiError(500, `Error updating librarian with MSNV=${req.params.msnv}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const librarianService = new LibrarianService(MongoDB.client);
        const document = await librarianService.delete(req.params.msnv);
        if (!document) {
            return next(new ApiError(404, "Librarian not found"));
        }
        return res.send({ message: "Librarian was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete librarian with MSNV=${req.params.msnv}`
            )
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const librarianService = new LibrarianService(MongoDB.client);
        const deletedCount = await librarianService.deleteAll();
        return res.send({
            message: `${deletedCount} librarians were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all librarians")
        );
    }
};
