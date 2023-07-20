const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // month starts from 0, so add 1 and pad with 0 if necessary
  const day = String(now.getDate()).padStart(2, "0"); // pad with 0 if necessary
  const hour = String(now.getHours()).padStart(2, "0"); // pad with 0 if necessary
  const minute = String(now.getMinutes()).padStart(2, "0"); // pad with 0 if necessary
  const second = String(now.getSeconds()).padStart(2, "0"); // pad with 0 if necessary

  const dateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  return dateTime;
};

const userTypesEnum = {
  ADMIN: "ADMIN",
  SUPPLIER: "SUPPLIER",
  AGENT: "AGENT",
  RIDER: "RIDER",
  CLIENT: "CLIENT",
};

const userRolesEnum = {
  ADMIN: "admin",
  SELLER: "seller",
  CLIENT: "client",
};

const statusEnum = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};
const agentsEarningTypesEnum = {
  AMOUNT: "AMOUNT",
  PERCENTAGE: "PERCENTAGE",
};

const verificationStatusEnum = {
  UNDER_REVIEW: "UNDER_REVIEW",
  REJECTED: "REJECTED",
  VERIFIED: "VERIFIED",
  APPROVED: "APPROVED",
};

const eventNamesEnum = {
  CyizereEventNames: "CyizereEventNames",
  CyizereSupplierEventNames: "CyizereSupplierEventNames",
  NtumaClientEventNames: "NtumaClientEventNames",
  NtumaAgentEventNames: "NtumaAgentEventNames",
  NtumaRiderEventNames: "NtumaRiderEventNames",
  NtumaAdminEventNames: "NtumaAdminEventNames",
  //markets
  ADD_MARKET: "ADD_MARKET",
  UPDATE_MARKET: "UPDATE_MARKET",
  DELETE_MARKET: "DELETE_MARKET",

  //shop categories
  ADD_SHOP_CATEGORY: "ADD_SHOP_CATEGORY",
  UPDATE_SHOP_CATEGORY: "UPDATE_SHOP_CATEGORY",
  DELETE_SHOP_CATEGORY: "DELETE_SHOP_CATEGORY",

  //product categories
  ADD_PRODUCT_CATEGORY: "ADD_PRODUCT_CATEGORY",
  UPDATE_PRODUCT_CATEGORY: "UPDATE_PRODUCT_CATEGORY",
  DELETE_PRODUCT_CATEGORY: "DELETE_PRODUCT_CATEGORY",

  //products
  ADD_PRODUCT: "ADD_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",

  //product prices
  ADD_PRODUCT_PRICE: "ADD_PRODUCT_PRICE",
  UPDATE_PRODUCT_PRICE: "UPDATE_PRODUCT_PRICE",
  DELETE_PRODUCT_PRICE: "DELETE_PRODUCT_PRICE",

  //delivery fees
  ADD_DELIVERY_FEES: "ADD_DELIVERY_FEES",
  UPDATE_DELIVERY_FEES: "UPDATE_DELIVERY_FEES",
  DELETE_DELIVERY_FEES: "DELETE_DELIVERY_FEES",

  //notifications
  ADD_NOTIFICATON: "ADD_NOTIFICATON",
  UPDATE_NOTIFICATON: "UPDATE_NOTIFICATON",
  DELETE_NOTIFICATON: "DELETE_NOTIFICATON",

  // =================
  //agents
  ADD_AGENT: "ADD_AGENT",
  UPDATE_AGENT: "UPDATE_AGENT",
  DELETE_AGENT: "DELETE_AGENT",

  //agents
  ADD_SUPPLIER: "ADD_SUPPLIER",
  UPDATE_SUPPLIER: "UPDATE_SUPPLIER",
  DELETE_SUPPLIER: "DELETE_SUPPLIER",

  //agents earning type
  ADD_AGENTS_FEES: "ADD_AGENTS_FEES",
  UPDATE_AGENTS_FEES: "UPDATE_AGENTS_FEES",

  //agents market subscription
  ADD_AGENTS_MARKET_SUBSCRIPTION: "ADD_AGENTS_MARKET_SUBSCRIPTION",
  UPDATE_AGENTS_MARKET_SUBSCRIPTION: "UPDATE_AGENTS_MARKET_SUBSCRIPTION",
  DELETE_AGENTS_MARKET_SUBSCRIPTION: "DELETE_AGENTS_MARKET_SUBSCRIPTION",

  //agents wallet
  ADD_AGENTS_WALLET: "ADD_AGENTS_WALLET",
  UPDATE_AGENTS_WALLET: "UPDATE_AGENTS_WALLET",
  DELETE_AGENTS_WALLET: "DELETE_AGENTS_WALLET",

  //banners
  ADD_BANNERS: "ADD_BANNERS",
  UPDATE_BANNERS: "UPDATE_BANNERS",
  DELETE_BANNERS: "DELETE_BANNERS",

  //dishes
  ADD_DISHES: "ADD_DISHES",
  UPDATE_DISHES: "UPDATE_DISHES",
  DELETE_DISHES: "DELETE_DISHES",

  //dish PRODUCTS
  ADD_DISH_PRODUCTS: "ADD_DISH_PRODUCTS",
  UPDATE_DISH_PRODUCTS: "UPDATE_DISH_PRODUCTS",
  DELETE_DISH_PRODUCTS: "DELETE_DISH_PRODUCTS",

  //messages
  ADD_MESSAGE: "ADD_MESSAGE",
  UPDATE_MESSAGE: "UPDATE_MESSAGE",
  DELETE_MESSAGE: "DELETE_MESSAGE",

  //orders
  ADD_ORDER: "ADD_ORDER",
  UPDATE_ORDER: "UPDATE_ORDER",
  DELETE_ORDER: "DELETE_ORDER",

  //riders
  ADD_RIDER: "ADD_RIDER",
  UPDATE_RIDER: "UPDATE_RIDER",
  DELETE_RIDER: "DELETE_RIDER",

  //riders wallet
  ADD_RIDERS_WALLET: "ADD_RIDERS_WALLET",
  UPDATE_RIDERS_WALLET: "UPDATE_RIDERS_WALLET",
  DELETE_RIDERS_WALLET: "DELETE_RIDERS_WALLET",

  //suppliers payment details
  ADD_SUPPLIERS_PAYMENT_DETAILS: "ADD_SUPPLIERS_PAYMENT_DETAILS",
  UPDATE_SUPPLIERS_PAYMENT_DETAILS: "UPDATE_SUPPLIERS_PAYMENT_DETAILS",
  DELETE_SUPPLIERS_PAYMENT_DETAILS: "DELETE_SUPPLIERS_PAYMENT_DETAILS",

  //transactions
  ADD_TRANSACTION: "ADD_TRANSACTION",
  UPDATE_TRANSACTION: "UPDATE_TRANSACTION",
  DELETE_TRANSACTION: "DELETE_TRANSACTION",

  //transactions
  ADD_USER: "ADD_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",

  //user's wallet
  ADD_WALLET: "ADD_WALLET",
  UPDATE_WALLET: "UPDATE_WALLET",
  DELETE_WALLET: "DELETE_WALLET",

  //system fees
  ADD_SYSTEM_FEES: "ADD_SYSTEM_FEES",
  UPDATE_SYSTEM_FEES: "UPDATE_SYSTEM_FEES",
  //packaging fees
  ADD_PACKAGING_FEES: "ADD_PACKAGING_FEES",
  UPDATE_PACKAGING_FEES: "UPDATE_PACKAGING_FEES",
};

const transactionTypeEnum = {
  WITHDRAW: "withdraw",
  DEPOSIT: "deposit",
};

const getRandomNumber = () => {
  const max = 99999;
  const min = 11111;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const saveNotification = async (userId, userType, title, message, io) => {
  try {
    const fbAdmin = require("firebase-admin");
    const db = require("../models");
    const Notifications = db.notifications;
    const newNotifiation = await Notifications.create({
      userId,
      userType,
      title,
      message,
    });

    const userToken = await db.app_tokens.findOne({
      userId,
      appType: userType,
    });

    if (userToken) {
      await fbAdmin.messaging().sendMulticast({
        tokens: [userToken.fbToken],
        notification: {
          title: title,
          body: message,
          imageUrl: "https://imgur.com/HnEkHcI",
        },
      });
    }

    if (userType === userTypesEnum.AGENT) {
      io.emit(eventNamesEnum.NtumaAgentEventNames, {
        type: eventNamesEnum.ADD_NOTIFICATON,
        data: { ...newNotifiation.dataValues },
      });
    } else if (userType === userTypesEnum.RIDER) {
      io.emit(eventNamesEnum.NtumaRiderEventNames, {
        type: eventNamesEnum.ADD_NOTIFICATON,
        data: { ...newNotifiation.dataValues },
      });
    } else {
      io.emit(eventNamesEnum.NtumaClientEventNames, {
        type: eventNamesEnum.ADD_NOTIFICATON,
        data: { ...newNotifiation.dataValues },
      });
    }

    return {
      status: "success",
      msg: "Notification saved!",
    };
  } catch (err) {
    return err;
  }
};

const saveAdminNotification = async (title, message, io) => {
  try {
    const db = require("../models");
    const Notifications = db.notifications;

    const adminUser = await db.users.findOne({
      role: "admin",
    });

    if (adminUser) {
      const noti = await Notifications.create({
        userId: adminUser.userId,
        userType: userTypesEnum.ADMIN,
        title,
        message,
      });
      io.emit(eventNamesEnum.NtumaAdminEventNames, {
        type: eventNamesEnum.ADD_NOTIFICATON,
        data: { ...noti.dataValues },
      });
    }

    return {
      status: "success",
      msg: "Notification saved!",
    };
  } catch (err) {
    return err;
  }
};

const handleSocketDataUpdate = async (
  queryObj,
  table,
  io,
  baseEventName,
  eventName
) => {
  const data = await table.findOne(queryObj);
  if (data) {
    io.emit(baseEventName, { type: eventName, data });
    return true;
  }
  return false;
};

const parseData = (data) => {
  try {
    const res = JSON.parse(data);
    return res;
  } catch (error) {
    return null;
  }
};

module.exports = {
  getCurrentDateTime,
  userTypesEnum,
  statusEnum,
  verificationStatusEnum,
  agentsEarningTypesEnum,
  transactionTypeEnum,
  eventNamesEnum,
  saveNotification,
  getRandomNumber,
  handleSocketDataUpdate,
  saveAdminNotification,
  userRolesEnum,
  parseData,
};
