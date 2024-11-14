const { ObjectId } = require("mongodb");

class BookService {
    constructor(client) {
        this.Book = client.db().collection("books");
    }

    extractBookData(payload) {
        const book = {
            MaSach: payload.MaSach,
            TenSach: payload.TenSach,
            DonGia: payload.DonGia,
            SoQuyen: payload.SoQuyen,
            NamXuatBan: payload.NamXuatBan,
            MaNXB: payload.MaNXB,
            TacGia: payload.TacGia,
            favorite: payload.favorite,
        };
        Object.keys(book).forEach(
            (key) => book[key] === undefined && delete book[key]
        );
        return book;
    }

    async create(payload) {
        try {
            const book = this.extractBookData(payload);
            const result = await this.Book.findOneAndUpdate(
                { MaSach: book.MaSach },
                { $set: book },
                { returnDocument: "after", upsert: true }
            );
            return result;
        } catch (error) {
            throw new Error(`Failed to create or update book: ${error.message}`);
        }
    }

    async find(filter) {
        const cursor = await this.Book.find(filter);
        return await cursor.toArray();
    }

    async findByName(TenSach) {
        return await this.find({
            TenSach: { $regex: new RegExp(new RegExp(TenSach)), $options: "i" },
        });
    }

    async findByMaSach(masach) {
        return await this.Book.findOne({
            MaSach: masach || null,
        });
    }

    async update(masach, payload) {
        const existingBook = await this.findByMaSach(payload.MaSach);
        if (existingBook && existingBook.MaSach !== masach) {
            throw new Error("MaSach already exists");
        }
        
        const filter = {
            MaSach: masach,
        };

        const update = this.extractBookData(payload);
        const result = await this.Book.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );

        return result;
    }

    async delete(masach) {
        const result = await this.Book.findOneAndDelete({
            MaSach: masach,
        });
        return result;
    }

    async findFavorite() {
        return await this.find({ favorite: true });
    }

    async deleteAll() {
        const result = await this.Book.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = BookService;