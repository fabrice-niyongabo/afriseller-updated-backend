module.exports = (sequelize, DataTypes) => {
  const Messages = sequelize.define(
    "messages",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      agentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "agent",
      },
      messageType: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "TEXT",
      },
      textMessage: {
        type: DataTypes.TEXT,
      },
      file: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "SENT",
      },
    },
    {
      timestamps: true,
    }
  );

  return Messages;
};
