exports.create = (req, res) => {
    res.send({ message: "Create new book successfully" });
};

exports.findAll = (req, res) => {
    res.send({ message: "Find all books successfully" });
};

exports.findOne = (req, res) => {
    res.send({ message: "Find expected book successfully" });
};

exports.update = (req, res) => {
    res.send({ message: "Update selected book successfully" });
};

exports.delete = (req, res) => {
    res.send({ message: "Delete selected book successfully" });
};

exports.deleteAll = (req, res) => {
    res.send({ message: "Delete all books successfully" });
};

exports.findAllFavorite = (req, res) => {
    res.send({ message: "Find all favorite books successfully" });
};