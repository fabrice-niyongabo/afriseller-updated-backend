require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(express.json({ limit: "50mb" }));

app.use(cors());
app.set("socketio", io);

//static
app.use("/uploads", express.static("./uploads"));

//socket
io.on("connection", (socket) => {
  console.log("A user connected");

  //take connected user's id
  socket.on("addUser", (userObj) => {
    console.log("user added");
    console.log({ userObj });
    console.log("Socket ID", socket.id);
  });

  //send to all users
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // removeUser(socket.id);
    // io.emit("getAllOnlineUsers", connectedUsers);
  });
});
//socket

//home route
app.get("/", (req, res) => {
  res.json({ message: "server is running" });
});

const usersRoute = require("./routes/users");
const marketsRoute = require("./routes/markets");
const shopCategoriesRoute = require("./routes/shopCategories");
const productCategoriesRoute = require("./routes/productCategories");
const productSubCategoriesRoute = require("./routes/productSubCategories");
const productsRoute = require("./routes/products");
const feesRoute = require("./routes/deliveryFees");
const ordersRoute = require("./routes/orders");
const walletRoute = require("./routes/wallet");
const dishesRoute = require("./routes/dishes");
const agentsRoute = require("./routes/agents");
const messagesRoute = require("./routes/messages");
const agentsWalletRoute = require("./routes/agentsWallet");
const agentsFeesRoute = require("./routes/agentsFees");
const notificationsRoute = require("./routes/notifications");
const ridersRoute = require("./routes/riders");
const ridersWalletRoute = require("./routes/ridersWallet");
const transactionsRoute = require("./routes/transactions");
const bannersRoute = require("./routes/banners");
const appTokensRoute = require("./routes/appTokens");
const systemFeesRoute = require("./routes/systemFees");
const packagingFeesRoute = require("./routes/packagingFees");
const suppliersRoute = require("./routes/suppliers");

const shopsRoute = require("./routes/shops");

app.use("/api/users/", usersRoute);
app.use("/api/agents/", agentsRoute);
app.use("/api/agents/fees/", agentsFeesRoute);
app.use("/api/markets/", marketsRoute);
app.use("/api/shopcategories/", shopCategoriesRoute);
app.use("/api/productcategories/", productCategoriesRoute);
app.use("/api/productsubcategories/", productSubCategoriesRoute);
app.use("/api/shops/", shopsRoute);

app.use("/api/products/", productsRoute);
app.use("/api/fees/", feesRoute);
app.use("/api/orders/", ordersRoute);
app.use("/api/wallet/", walletRoute);
app.use("/api/dishes/", dishesRoute);
app.use("/api/messages/", messagesRoute);
app.use("/api/agentswallet/", agentsWalletRoute);
app.use("/api/notifications/", notificationsRoute);
app.use("/api/riders/", ridersRoute);
app.use("/api/riderswallet/", ridersWalletRoute);
app.use("/api/transactions/", transactionsRoute);
app.use("/api/banners/", bannersRoute);
app.use("/api/apptokens/", appTokensRoute);
app.use("/api/systemfees/", systemFeesRoute);
app.use("/api/packagingfees/", packagingFeesRoute);
app.use("/api/suppliers/", suppliersRoute);

//404 route
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    msg: "The page does not exist on the server.",
    error: {
      statusCode: 404,
      message: "The page does not exist on the server.",
    },
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
