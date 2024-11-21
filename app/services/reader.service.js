const { ObjectId } = require("mongodb");

class ReaderService {
    constructor(client) {
        this.Reader = client.db().collection("readers");
    }

    extractReaderData(payload) {
        const reader = {
            MaDocGia: payload.MaDocGia,
            HoLot: payload.HoLot,
            Ten: payload.Ten,
            NgaySinh: payload.NgaySinh,
            Phai: payload.Phai,
            DiaChi: payload.DiaChi,
            DienThoai: payload.DienThoai,
        };
        Object.keys(reader).forEach(
            (key) => reader[key] === undefined && delete reader[key]
        );
        return reader;
    }

    async create(payload) {
        try {
            const reader = this.extractReaderData(payload);
            const result = await this.Reader.findOneAndUpdate(
                { MaDocGia: reader.MaDocGia }, 
                { $set: reader }, 
                { returnDocument: "after", upsert: true }
            );
            return result;
        } catch (error) {
            throw new Error(`Failed to create or update reader: ${error.message}`);
        }
    }

    async findByName(Ten) {
        try {
            const regex = new RegExp(Ten, "i");
            const result = await this.Reader.find({ Ten: { $regex: regex } }).toArray();
            return result;
        } catch (error) {
            throw new Error(`Failed to find readers by name: ${error.message}`);
        }
    }

    async find(filter) {
        try {
            const result = await this.Reader.find(filter).toArray();
            return result;
        } catch (error) {
            throw new Error(`Failed to retrieve readers: ${error.message}`);
        }
    }

    async findByMaDocGia(maDocGia) {
        return await this.Reader.findOne({
            MaDocGia: maDocGia || null,
        });
    }

    async update(maDocGia, payload) {
        const existingReader = await this.findByMaDocGia(payload.MaDocGia);
        if (existingReader && existingReader.MaDocGia !== maDocGia) {
            throw new Error("MaDocGia already exists");
        }

        const filter = {
            MaDocGia: maDocGia,
        };

        const update = this.extractReaderData(payload);
        const result = await this.Reader.findOneAndUpdate(
            filter,
            { $set: update }, 
            { returnDocument: "after" } 
        );

        return result;
    }

    async delete(maDocGia) {
        const result = await this.Reader.findOneAndDelete({ MaDocGia: maDocGia });
        return result;
    }

    async deleteAll() {
        const result = await this.Reader.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ReaderService;
