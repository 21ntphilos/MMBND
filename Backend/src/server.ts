import express, { Application, NextFunction, Response, Request } from "express";
import { CLIENT } from "./config/config";
import cors from "cors";
import logger from "morgan";
import ErrorHandler from "./middlewares/errorMiddleWare";
import userRouter from "./route/userRoute";
import AdminRouter from './route/adminRoutes'
import cookiePaser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

class Wares {
	private UserRoutes = new userRouter();
    private AdminRoutes = new AdminRouter()

    constructor(app: Application) {
		app
			.use(express.json())
			.use(express.urlencoded({ extended: false }))
			.use(cookiePaser())
			.use(
				cors({
					origin: [CLIENT, "http://localhost:3000", "http://localhost:5111"],
					credentials: true,
				})
			)
			.use(logger("dev"));
		
		app.use("/user", this.UserRoutes.router);
        app.use("/admin", this.AdminRoutes.router);

		app.get("/", (req: Request, res: Response, next: NextFunction) => {
			return res.status(200).json({
				message: "Welcome to MonieMove",
			});
		});

		app.use(ErrorHandler);
	}
}

export default Wares;
