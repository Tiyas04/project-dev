import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);


// routes import
import userRouter from "./routes/user.route.js";

// Keep-alive check endpoint
app.get("/api/v1/ping", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is awake and healthy",
        timestamp: new Date().toISOString()
    });
});

// routes declaration
app.use("/api/v1/users", userRouter);

export default app;