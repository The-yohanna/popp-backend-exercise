import express from "express";
import { json } from "body-parser";
import routes from "@/routes";
import { authMiddleware } from '@/middleware/auth';

const app = express();

app.use(json());
app.use("/api", authMiddleware, routes);

export default app;
