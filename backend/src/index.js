import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import app from "./app.js";
import { startKeepAlive } from "./utils/keepAlive.js";

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            startKeepAlive();
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });