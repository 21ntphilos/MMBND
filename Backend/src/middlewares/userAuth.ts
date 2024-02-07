import { NextFunction, Response, Request } from "express";
import { JwtPayload } from "jsonwebtoken"
import { verifyToken } from "../utils/generators"
import Exception from "../utils/errorHandler"

export function userAuth(req: JwtPayload, res: Response, next: NextFunction){
   try {

      if (req.headers.authorization) {
            const poken = req.headers.authorization.split(" ")[1];

            if (!poken) throw new Exception(401, "No token Provided");
            //verify the token and get payload of it
            const verify = verifyToken(poken) as JwtPayload;
            console.log(verify);
            if (!verify)
                throw new Exception(
                    401,
                    "UNAUTHORIZED Invalid Token Or Expired token"
                );

            req.user = verify;

            next();
			}else{
                throw new Exception(401, "No token Provided");
            }
       
   } catch (error:any ) {
    console.log (error)
    return res.status(400).json({
        statusCode: error.statusCode,
        message: error.message
    })
   }
}