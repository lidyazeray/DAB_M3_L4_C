module.exports = (sequelize, Sequelize) => {
    const Hotel = sequelize.define('Hotel', {
        Name: Sequelize.DataTypes.STRING,
        Location: Sequelize.DataTypes.STRING
    },{
        tableName: 'Hotels',  
        timestamps: false
    });
    Hotel.associate = function(models) {
        Hotel.hasMany(models.Room);
        Hotel.belongsToMany(models.User, {through: models.Rate})
    };
	return Hotel
}