const { QueryTypes } = require("sequelize");

class RoomService {
    constructor(db) {
        this.client = db.sequelize;
    }
    async get() {
        try {
            const rooms = await this.client.query(
                "SELECT * FROM Rooms", 
                { type: QueryTypes.SELECT }
            );
            return rooms;
        } catch (err) {
            console.error("Error fetching rooms:", err);
            return err;
        }
    }
    async create(capacity, pricePerDay, hotelId) {
        try {
            const result = await this.client.query(
                "INSERT INTO Rooms (Capacity, PricePerDay, HotelId) VALUES (:Capacity, :PricePerDay, :HotelId)",
                {
                    replacements: { Capacity: capacity, PricePerDay: pricePerDay, HotelId: hotelId },
                }
            );
            return result;
        } catch (err) {
            console.error("Error creating a room:", err);
            return err;
        }
    }
    async getHotelRooms(hotelId) {
        try {
            const rooms = await this.client.query(
                "SELECT * FROM Rooms WHERE HotelId = :hotelId",
                { replacements: { hotelId }, type: QueryTypes.SELECT }
            );
            return rooms;
        } catch (err) {
            console.error("Error fetching hotel rooms:", err);
            return err;
        }
    }
    async deleteRoom(roomId) {
        try {
            const result = await this.client.query(
                "DELETE FROM Rooms WHERE id = :roomId",
                { replacements: { roomId } }
            );
            return result;
        } catch (err) {
            console.error("Error deleting a room:", err);
            return err;
        }
    }
    async rentARoom(userId, roomId, startDate, endDate) {
        try {
            const result = await this.client.query(
                "CALL insert_reservation(:UserId, :RoomId, :StartDate, :EndDate)",
                {
                    replacements: { UserId: userId, RoomId: roomId, StartDate: startDate, EndDate: endDate },
                }
            );
            return result;
        } catch (err) {
            console.error("Error renting a room:", err);
            return err;
        }
    }
}

module.exports = RoomService;
