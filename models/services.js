module.exports = (sequelize, DataTypes) => {
  const Services = sequelize.define(
    "services",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
      },
    },
    {
      timestamps: true,
    }
  );

  return Services;
};
