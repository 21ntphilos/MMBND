import { NextFunction, Response, Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyAdmin, verifyToken } from "../utils";
import Exception from "../utils/errorHandler";

export function adminAuth(
	req: JwtPayload,
	res: Response,
	next: NextFunction
) {
	try {
		const poken =
			(req.headers.authorization && req.headers.authorization.split(" ")[1]) ||
			(req.cookies && req.cookies.token);

		if (!poken) throw new Exception(401, "Please Login");

		const verify = verifyToken(poken) as JwtPayload;

		console.log("This IS VERIFY",verify)
		if (!verify)
			throw new Exception(401, "UNAUTHORIZED, Pls Login");

			console.log("ROLE", verify.role)
        if (verify.role === "Admin" || "SuperAdmin"){
			req.user = verify;
			next();
			return	
		} 
		
		throw new Exception(401, "UnAuthorised!! This Service is For Admins Only ")

	} catch (error: any) {
		return res.status(400).json({
			statusCode: error.statusCode,
			message: error.message,
		});
	}
}
