const PublisherService = require("../services/publisher.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    const { MaNXB, TenNXB, DiaChi } = req.body;

    if (!MaNXB || !TenNXB || !DiaChi) {
        return next(new ApiError(400, "All fields are required"));
    }

    try {
        const publisherService = new PublisherService(MongoDB.client);
        const document = await publisherService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the publisher information")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const publisherService = new PublisherService(MongoDB.client);
        const { TenNXB } = req.query;
        if (TenNXB) {
            documents = await publisherService.findByName(TenNXB);
        } else {
            documents = await publisherService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving publishers")
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const publisherService = new PublisherService(MongoDB.client);
        const document = await publisherService.findByMaNXB(req.params.manxb);
        if (!document) {
            return next(new ApiError(404, "Publisher not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving publisher with MaNXB=${req.params.manxb}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const publisherService = new PublisherService(MongoDB.client);
        const document = await publisherService.update(req.params.manxb, req.body);
        if (!document) {
            return next(new ApiError(404, "Publisher not found"));
        }
        return res.send({ message: "Publisher was updated successfully" });
    } catch (error) {
        if (error.message === "MaNXB already exists") {
            return next(new ApiError(400, "MaNXB already exists"));
        }
        return next(
            new ApiError(500, `Error updating publisher with MaNXB=${req.params.manxb}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const publisherService = new PublisherService(MongoDB.client);
        const document = await publisherService.delete(req.params.manxb);
        if (!document) {
            return next(new ApiError(404, "Publisher not found"));
        }
        return res.send({ message: "Publisher was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete publisher with MaNXB=${req.params.manxb}`
            )
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const publisherService = new PublisherService(MongoDB.client);
        const deletedCount = await publisherService.deleteAll();
        return res.send({
            message: `${deletedCount} publishers were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all publishers")
        );
    }
};
