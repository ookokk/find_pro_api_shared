require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const { initWebsocketServer } = require("./services/websocket");

mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.resolve("./public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());

app.use("/login", routes.loginRoute);
app.use("/register", routes.registerRoute);
app.use("/user", routes.userRoute);
app.use("/photo", routes.photoRoute);
app.use("/message", routes.messageRoute);

initWebsocketServer(server);

server.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
