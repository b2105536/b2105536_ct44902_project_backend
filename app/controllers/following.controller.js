const FollowingService = require("../services/following.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    const { MaDocGia, MaSach, NgayMuon, NgayTra } = req.body;

    if (!MaDocGia || !MaSach || !NgayMuon || !NgayTra) {
        return next(new ApiError(400, "All fields are required"));
    }

    try {
        const followingService = new FollowingService(MongoDB.client);
        const document = await followingService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(400, error.message));
        //return next(new ApiError(500, "An error occurred while creating the following record"));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const followingService = new FollowingService(MongoDB.client);
        documents = await followingService.findAll();
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving following records"));
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    const identifier = req.params.identifier;

    try {
        const followingService = new FollowingService(MongoDB.client);
        const document = await followingService.findByReaderOrBook(identifier);
        if (!document) {
            return next(new ApiError(404, "Following record not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Error retrieving following record with identifier=${identifier}`));
    }
};

exports.update = async (req, res, next) => {
    const identifier = req.params.identifier;

    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const followingService = new FollowingService(MongoDB.client);
        const result = await followingService.update(identifier, req.body);
        if (result.matchedCount === 0) {
            return next(new ApiError(404, "Following record not found"));
        }
        return res.send({ message: "Following record was updated successfully" });
    } catch (error) {
        return next(new ApiError(500, `Error updating following record with identifier=${identifier}`));
    }
};

exports.delete = async (req, res, next) => {
    const identifier = req.params.identifier;

    try {
        const followingService = new FollowingService(MongoDB.client);
        const result = await followingService.delete(identifier);
        if (result.deletedCount === 0) {
            return next(new ApiError(404, "Following record not found"));
        }
        return res.send({ message: "Following record was deleted successfully" });
    } catch (error) {
        return next(new ApiError(500, `Could not delete following record with identifier=${identifier}`));
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const followingService = new FollowingService(MongoDB.client);
        const deletedCount = await followingService.deleteAll();
        return res.send({
            message: `${deletedCount} following records were deleted successfully`,
        });
    } catch (error) {
        return next(new ApiError(500, "An error occurred while removing all following records"));
    }
};
