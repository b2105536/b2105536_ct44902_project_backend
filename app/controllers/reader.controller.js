const ReaderService = require("../services/reader.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    const { MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = req.body;

    if (!MaDocGia || !HoLot || !Ten || !NgaySinh || !Phai || !DiaChi || !DienThoai) {
        return next(new ApiError(400, "All fields are required"));
    }

    const dob = new Date(NgaySinh);
    if (isNaN(dob.getTime())) {
        return next(new ApiError(400, "Date of birth is invalid (yyyy-mm-dd)"));
    }

    const today = new Date();
    if (dob > today) {
        return next(new ApiError(400, "Date of birth cannot be in future"));
    }

    if (typeof Phai !== 'boolean') {
        return next(new ApiError(400, "Phai must be true or false"));
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(DienThoai)) {
        return next(new ApiError(400, "Phone number is invalid"));
    }

    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the reader information")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const readerService = new ReaderService(MongoDB.client);
        const { Ten } = req.query;
        if (Ten) {
            documents = await readerService.findByName(Ten);
        } else {
            documents = await readerService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving readers")
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.findByMaDocGia(req.params.madocgia);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving reader with MaDocGia=${req.params.madocgia}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.update(req.params.madocgia, req.body);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send({ message: "Reader was updated successfully" });
    } catch (error) {
        if (error.message === "MaDocGia already exists") {
            return next(new ApiError(400, "MaDocGia already exists"));
        }
        return next(
            new ApiError(500, `Error updating reader with MaDocGia=${req.params.madocgia}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const document = await readerService.delete(req.params.madocgia);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send({ message: "Reader was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete reader with MaDocGia=${req.params.madocgia}`
            )
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const readerService = new ReaderService(MongoDB.client);
        const deletedCount = await readerService.deleteAll();
        return res.send({
            message: `${deletedCount} readers were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all readers")
        );
    }
};
