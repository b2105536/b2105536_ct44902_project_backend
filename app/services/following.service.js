const { ObjectId } = require("mongodb");

class FollowingService {
    constructor(client) {
        this.Following = client.db().collection("following");
        this.Books = client.db().collection("books");
        this.Readers = client.db().collection("readers");
    }

    extractFollowingData(payload) {
        const following = {
            MaDocGia: payload.MaDocGia,
            MaSach: payload.MaSach,
            NgayMuon: payload.NgayMuon,
            NgayTra: payload.NgayTra,
        };
        Object.keys(following).forEach(
            (key) => following[key] === undefined && delete following[key]
        );
        return following;
    }

    async create(payload) {
        const { MaDocGia, MaSach, NgayMuon, NgayTra } = payload;

        const readerExists = await this.Readers.findOne({ MaDocGia });
        if (!readerExists) {
            throw new Error("Reader not found with the given MaDocGia");
        }

        const bookExists = await this.Books.findOne({ MaSach });
        if (!bookExists) {
            throw new Error("Book not found with the given MaSach");
        }

        const currentDate = new Date();
        const borrowDate = new Date(NgayMuon);
        if (borrowDate > currentDate) {
            throw new Error("The borrow date cannot be later than the current date");
        }

        const returnDate = new Date(NgayTra);
        if (returnDate <= borrowDate) {
            throw new Error("The return date must be later than the borrow date");
        }

        if (isNaN(borrowDate.getTime()) || isNaN(returnDate.getTime())) {
            throw new Error("Invalid date format");
        }

        try {
            const following = this.extractFollowingData(payload);
            const result = await this.Following.insertOne(following);
            return result;
        } catch (error) {
            throw new Error(`Failed to create following record: ${error.message}`);
        }
    }

    async findAll() {
        try {
            const result = await this.Following.find().toArray();
            return result;
        } catch (error) {
            throw new Error(`Failed to retrieve all following records: ${error.message}`);
        }
    }

    async findByReaderOrBook(identifier) {
        try {
            const filter = { $or: [{ MaDocGia: identifier }, { MaSach: identifier }] };
            const result = await this.Following.find(filter).toArray();
            return result;
        } catch (error) {
            throw new Error(`Failed to retrieve following record by identifier: ${error.message}`);
        }
    }

    async update(identifier, payload) {
        const filter = { $or: [{ MaDocGia: identifier }, { MaSach: identifier }] };
        const update = this.extractFollowingData(payload);

        const result = await this.Following.updateOne(filter, {
            $set: update,
        });

        return result;
    }

    async delete(identifier) {
        const filter = { $or: [{ MaDocGia: identifier }, { MaSach: identifier }] };
        const result = await this.Following.deleteOne(filter);
        return result;
    }

    async deleteAll() {
        const result = await this.Following.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = FollowingService;
