import multer from "multer" 
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { Cloudinary } from "../config/config";
import Exception from "./errorHandler";
const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: Cloudinary.cloudName,
	api_key: Cloudinary.API_key,
	api_secret: Cloudinary.API_Secret,
});

const Storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: async (req, file) => {
		return {
			folder: "MonieMoved",
		};
	},
})

const getPublicId = (imageUrl: string) => {
	const parts = imageUrl.split("/");
	const publicId = parts[parts.length - 1].split(".")[0];
	return publicId;
};

export const bulkImageDelete = async (images: string[]) => {
	try { 
		const deletePromises = images.map((image) => {
			const publicId = getPublicId(image);
			return cloudinary.uploader.destroy(publicId);
		});
		 const results = await Promise.all(deletePromises);
		 return results
	}catch(error){
		throw new Exception(501, "Unable to delete Images");
	}
}
export const deleteSingleImage = async (imageUrl: string) => {
	try {
		const publicId = getPublicId(imageUrl);
		const result = await cloudinary.uploader.destroy(publicId);
		return result 
	} catch (error) {
		throw new Exception(501, "Unable to delete Image")
	}
};

export const upload = multer({
	storage:Storage,
 fileFilter:(req, file, cb)=>{
	const fileTypes = ["image/jpeg", "image/png"];
	const filesize = 1 * 1024 * 1024 // 1 MB

	if(!fileTypes.includes(file.mimetype)){ cb(new Error("Invalid file type. Only JPEG and PNG files are allowed."));}
	if(file.size > filesize){cb(new Error("File size exceeds the maximum allowed limit. pls ensure the file size to 1 Mb"));}
	
	cb(null, true)
	
	}
})