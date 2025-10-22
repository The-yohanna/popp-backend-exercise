import { NextFunction, Request, Response } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header"
        });
    }

    const token = authHeader.split(" ")[1];
    const apiToken = process.env.API_TOKEN;

    if (!apiToken) {
        console.error("API_TOKEN secret not set in environment");
        return res.status(500).json({
            error: "Server configuration error"
        });
    }

    if (token !== apiToken) {
        return res.status(401).json({
            error: "Unauthorized: Invalid token"
        });
    }

    next();
}