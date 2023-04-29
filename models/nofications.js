module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define(
    "notifications",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userType: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "-",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isViewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return Notifications;
};
