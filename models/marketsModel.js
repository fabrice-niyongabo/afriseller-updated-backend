module.exports = (sequelize, DataTypes) => {
  const Markets = sequelize.define(
    "markets",
    {
      mId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          args: true,
          msg: "Market name already in use!",
        },
      },
      bikeMaximumKm: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      lat: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      long: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      open: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      close: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return Markets;
};
