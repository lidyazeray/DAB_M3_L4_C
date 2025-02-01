const { QueryTypes } = require('sequelize');

class HotelService {
    constructor(db) {
        this.client = db.sequelize; // ✅ Ensure this.client is used for queries
    }

    // ✅ Create a hotel using raw SQL
    async create(name, location) {
        try {
            const result = await this.client.query(
                'INSERT INTO Hotels (Name, Location) VALUES (:Name, :Location)',
                { replacements: { Name: name, Location: location } }
            );
            return result;
        } catch (err) {
            console.error("Error inserting hotel:", err);
            return err;
        }
    }

    // ✅ Get all hotels using raw SQL
    async get() {
        try {
            const hotels = await this.client.query(
                'SELECT * FROM Hotels', // ✅ Ensure table name is 'Hotels'
                { type: QueryTypes.SELECT }
            );
            if (!Array.isArray(hotels)) {
                console.log("WARNING: get() returned a non-array. Fixing...");
                return [];
            }
            return hotels;
        } catch (err) {
            console.error("Error fetching hotels:", err);
            return [];
        }
    }

    // ✅ Get hotel details using raw SQL
    async getHotelDetails(hotelId, userId) {
        try {
            // Retrieve hotel data
            const hotel = await this.client.query(
                'SELECT h.id, h.Name, h.Location, ROUND(AVG(r.Value), 1) AS AvgRate FROM Hotels h LEFT JOIN Rates r ON h.id = r.HotelId WHERE h.id = :hotelId',
                { replacements: { hotelId }, type: QueryTypes.SELECT }
            );

            // Retrieve user rating count
            const userRateCount = await this.client.query(
                'SELECT COUNT(*) as Rated FROM Rates WHERE HotelId = :hotelId AND UserId = :userId',
                { replacements: { hotelId, userId }, type: QueryTypes.SELECT }
            );

            // ✅ Check if the user has rated this hotel.
            if (userRateCount[0].Rated > 0) {
                hotel[0].Rated = true;
            } else {
                hotel[0].Rated = false;
            }

            return hotel[0];
        } catch (err) {
            console.error("Error fetching hotel details:", err);
            return err;
        }
    }

    // ✅ Delete a hotel using raw SQL
    async deleteHotel(hotelId) {
        try {
            const result = await this.client.query(
                'DELETE FROM Hotels WHERE id = :hotelId',
                { replacements: { hotelId } }
            );
            return result;
        } catch (err) {
            console.error("Error deleting hotel:", err); // ❌ Fixed error message
            return err;
        }
    }

    // ✅ Rate a hotel using raw SQL
    async makeARate(userId, hotelId, value) {
        try {
            const result = await this.client.query(
                'INSERT INTO Rates (Value, HotelId, UserId) VALUES (:value, :hotelId, :userId)',
                { replacements: { userId, hotelId, value } }
            );
            return result;
        } catch (err) {
            console.error("Error rating hotel:", err); 
            return err;
        }
    }
}

module.exports = HotelService;
