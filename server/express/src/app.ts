import express from "express";
import { cors } from "./middleware/cors.middleware.ts";
import { errorHandler } from "./middleware/error.middleware.ts";
import { notFound } from "./middleware/notFound.middleware.ts";
import todoRouter from "./routes/todo.route.ts";
import userRouter from "./routes/user.route.ts";

const app = express();

app.use(express.json());
app.use(cors);

app.use("/todos", todoRouter);
app.use("/users", userRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
