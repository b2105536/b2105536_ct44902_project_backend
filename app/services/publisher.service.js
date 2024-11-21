const { ObjectId } = require("mongodb");

class PublisherService {
    constructor(client) {
        this.Publisher = client.db().collection("publishers");
    }

    extractPublisherData(payload) {
        const publisher = {
            MaNXB: payload.MaNXB,
            TenNXB: payload.TenNXB,
            DiaChi: payload.DiaChi,
        };
        Object.keys(publisher).forEach(
            (key) => publisher[key] === undefined && delete publisher[key]
        );
        return publisher;
    }

    async create(payload) {
        try {
            const publisher = this.extractPublisherData(payload);
            const result = await this.Publisher.findOneAndUpdate(
                { MaNXB: publisher.MaNXB }, 
                { $set: publisher },      
                { returnDocument: "after", upsert: true } 
            );
            return result;
        } catch (error) {
            throw new Error(`Failed to create or update publisher: ${error.message}`);
        }
    }

    async findByName(TenNXB) {
        try {
            const regex = new RegExp(TenNXB, "i");
            const result = await this.Publisher.find({ TenNXB: { $regex: regex } }).toArray();
            return result;
        } catch (error) {
            throw new Error(`Failed to find publishers by name: ${error.message}`);
        }
    }

    async find(filter) {
        try {
            const result = await this.Publisher.find(filter).toArray();
            return result;
        } catch (error) {
            throw new Error(`Failed to retrieve publishers: ${error.message}`);
        }
    }

    async findByMaNXB(manxb) {
        return await this.Publisher.findOne({
            MaNXB: manxb || null,
        });
    }

    async update(manxb, payload) {
        const existingPublisher = await this.findByMaNXB(payload.MaNXB);
        if (existingPublisher && existingPublisher.MaNXB !== manxb) {
            throw new Error("MaNXB already exists");
        }

        const filter = {
            MaNXB: manxb,
        };

        const update = this.extractPublisherData(payload);
        const result = await this.Publisher.findOneAndUpdate(
            filter,
            { $set: update }, 
            { returnDocument: "after" } 
        );

        return result;
    }

    async delete(manxb) {
        const result = await this.Publisher.findOneAndDelete({ MaNXB: manxb });
        return result;
    }

    async deleteAll() {
        const result = await this.Publisher.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = PublisherService;
