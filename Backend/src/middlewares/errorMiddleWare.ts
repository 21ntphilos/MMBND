import { Request, Response, NextFunction } from 'express'
import { HttpError } from 'http-errors'
import multer from 'multer';

function errorHandler(
	error:  HttpError ,
	req: Request,
	res: Response,
	next: NextFunction
) {
	// Log the error for debugging purposes
	console.error("AN ERROR OCCURED --> ", error);
	console.error("ERROR NAME -->",error.name)
	console.log("ERROR STACK -->",error.stack);

	// Handle different types of errors
	if( error.code === 'INVALID_FILE_TYPE') {
		return res.status(415).json({ error:error.message}) ;
	} 
	if (error instanceof multer.MulterError){
		
		if (error.code === 'LIMIT_FILE_SIZE') {
        // File size limit exceeded
        return res.status(415).json({ error: 'File size limit exceeded' });
		}	
	}
	if (error.name === "ValidationError") {
		// Handle validation errors
		return res
			.status(400)
			.json({ error: "Validation error", message: error.message });
	} else if (error.name === "JsonWebTokenError") {
		return res
			.status(401)
			.json({ error: "Unauthorized", message: error.message });
	} else if (error.name === "ConflictError") {
		return res.status(409).json({ error: "Conflict", message: error.message });
	} else if (error.name === "ServiceUnavailableError") {
		return res
			.status(503)
			.json({ error: "ServiceUnavailable", message: error.message });
	}
		// Handle other types of errors
		return res.status(400).json({
			kkk: error.statusCode,
			message: error.message,
		});

}

export default errorHandler;