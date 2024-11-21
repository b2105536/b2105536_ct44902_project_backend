const { ObjectId } = require("mongodb");

class LibrarianService {
    constructor(client) {
        this.Librarian = client.db().collection("librarians");
    }

    extractLibRRNData(payload) {
        const librarian = {
            MSNV: payload.MSNV,
            HoTenNV: payload.HoTenNV,
            Password: payload.Password,
            Chucvu: payload.Chucvu,
            Diachi: payload.Diachi,
            SoDienThoai: payload.SoDienThoai,
        };
        Object.keys(librarian).forEach(
            (key) => librarian[key] === undefined && delete librarian[key]
        );
        return librarian;
    }

    async create(payload) {
        try {
            const librarian = this.extractLibRRNData(payload);
            const result = await this.Librarian.findOneAndUpdate(
                { MSNV: librarian.MSNV }, 
                { $set: librarian },      
                { returnDocument: "after", upsert: true } 
            );
            return result;
        } catch (error) {
            throw new Error(`Failed to create or update librarian: ${error.message}`);
        }
    }

    async findByName(HoTenNV) {
        try {
            const regex = new RegExp(HoTenNV, "i");
            const result = await this.Librarian.find({ HoTenNV: { $regex: regex } }).toArray();
            return result;
        } catch (error) {
            throw new Error(`Failed to find librarians by name: ${error.message}`);
        }
    }

    async find(filter) {
        try {
            const result = await this.Librarian.find(filter).toArray();
            return result;
        } catch (error) {
            throw new Error(`Failed to retrieve librarians: ${error.message}`);
        }
    }

    async findByMSNV(msnv) {
        return await this.Librarian.findOne({
            MSNV: msnv || null,
        });
    }

    async update(msnv, payload) {
        const existingLibrarian = await this.findByMSNV(payload.MSNV);
        if (existingLibrarian && existingLibrarian.MSNV !== msnv) {
            throw new Error("MSNV already exists");
        }

        const filter = {
            MSNV: msnv,
        };

        const update = this.extractLibRRNData(payload);
        const result = await this.Librarian.findOneAndUpdate(
            filter,
            { $set: update }, 
            { returnDocument: "after" } 
        );

        return result;
    }

    async delete(msnv) {
        const result = await this.Librarian.findOneAndDelete({ MSNV: msnv });
        return result;
    }

    async deleteAll() {
        const result = await this.Librarian.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = LibrarianService;