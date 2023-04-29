module.exports = (sequelize, DataTypes) => {
  const Banners = sequelize.define(
    "banners",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      urlOrComponentValue: {
        type: DataTypes.TEXT,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      hasUrl: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hasScreenComponent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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

  return Banners;
};
