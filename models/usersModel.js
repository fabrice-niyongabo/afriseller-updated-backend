module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "users",
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(18),
        unique: {
          args: true,
          msg: "Phone number already in use!",
        },
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      role: {
        type: DataTypes.TEXT,
        defaultValue: "client",
        allowNull: false,
      },
      shopId: {
        type: DataTypes.INTEGER,
      },
      image: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletionFeedback: {
        type: DataTypes.TEXT,
      },
    },
    {
      timestamps: true,
    }
  );

  return Users;
};
