
import Joi from "joi"
import { pUpdatepayload } from "./typesAndPayloads";



class Validators {
	private option = {
		abortEarly: false,
		errors: {
			wrap: {
				label: "",
			},
		},
	};

	public registerValidator = (data: any) => {
		return Joi.object()
			.keys({
				password: Joi.string()
					.trim()
					.min(6)
					.pattern(new RegExp(/^[A-Za-z0-9+\-!@#$%^&*()]{6,30}$/)),
				confirmPassword: Joi.equal(Joi.ref("password"))
					.required()
					.label("Confirm password")
					.messages({ "any.only": "{{#label}} does not match" }),
				email: Joi.string().email().required(),
				firstName: Joi.string().required(),
				lastName: Joi.string().required(),
			})
			.validate(data, this.option);
	};
	public loginValidator = (data: any) => {
		return Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string()
				.pattern(new RegExp(/^[A-Za-z0-9+\-!@#$%^&*()]{6,30}$/))
				.required(),
		}).validate(data, this.option);
	};

	public changePassValidator = (data: any) => {
		return Joi.object({
			currentPassword: Joi.string()
				.min(6)
				.pattern(new RegExp(/^[A-Za-z0-9+\-!@#$%^&*()]{6,30}$/))
				.required(),
			newPassword: Joi.string()
				.min(6)
				.pattern(new RegExp(/^[A-Za-z0-9+\-!@#$%^&*()]{6,30}$/))
				.required(),
		}).validate(data, this.option);
	};

	public emailValidator = (data: any) => {
		return Joi.object({
			email: Joi.string().email().required(),
		}).validate(data, this.option);
	};

	public resetPassValidator = (data: any) => {
		return Joi.object({
			password: Joi.string()
				.trim()
				.min(6)
				.pattern(new RegExp(/^[A-Za-z0-9+\-!@#$%^&*()]{3,30}$/)),
			confirmPassword: Joi.equal(Joi.ref("password"))
				.required()
				.label("Confirm password")
				.messages({ "any.only": "{{#label}} does not match" }),
		}).validate(data, this.option);
	};

	public pUpdateValidator = (data: pUpdatepayload) => {
		return Joi.object({
			businessEmail: Joi.string()
				.email()
				.required(),
			phoneNumber: Joi.string()
				.regex(/^\+?[0-9][0-9]{7,14}$/)
				.rule({
					message:
						"Wrong Phone Format, make sure the number is correctly written",
				})
				.required(),
			businessRegNo: Joi.string().trim().alphanum().required(),
			businessName: Joi.string().trim().required(),
			businessAddress: Joi.string().trim().required(),
			businessDecription: Joi.string().trim().required(),
			TIN_Number: Joi.string()
				.trim()
				.regex(/([0-9]){14}/)
				.required(),
			accountNumber: Joi.string()
				.regex(/[0-9]{10,15}/)
				.rule({
					message:
						"Wrong Format, make sure the account number is correctly written",
				})
				.required(),
			bankName: Joi.string().required(),
			website: Joi.string().optional(),
			profileImage: Joi.string().optional(),
		}).validate(data, this.option);
	};

	public contractValidator = (data: any) => {
		return Joi.object({
			title: Joi.string().required(),
			description: Joi.string().required(),
			location: Joi.string(),
			image: Joi.string(),
			minPrice: Joi.number().less(Joi.ref("maxPrice")).required(),
			maxPrice: Joi.number().required(),
			quantity: Joi.number(),
			specifications: Joi.string(),
			duration: Joi.string().regex(/^\d+$/),
		}).validate(data, this.option);
	};

	public updateContractValidator = (data: any) => {
		
		return Joi.object({
			title: Joi.string(),
			description: Joi.string(),
			location: Joi.string(),
			image: Joi.string(),
			specifications: Joi.object().pattern(
				Joi.string(),
				Joi.alternatives().try(Joi.string(), Joi.number())
				),
			price: Joi.number(),
			quantity: Joi.number(),
			minPrice: Joi.number().less(Joi.ref("maxPrice")), // should be a price range client can pay
			maxPrice: Joi.number(),
			duration: Joi.number(),
		}).validate(data, this.option);
	};
	public tenderValidator = (data: any) => {
		return Joi.object({
			price: Joi.number().required(),
			pictureofPreviousJob: Joi.string(),
			duration: Joi.number(),
			pitch: Joi.string().required(),
		}).validate(data, this.option);
	};
	public tenderUpdatedValidator = (data:any)=>
	{	return Joi.object({
			price: Joi.number(),
			pictureofPreviousJob: Joi.string(),
			duration: Joi.number(),
			pitch: Joi.string().required(),
		}).validate(data, this.option);
	}

	public rateVendor = (data:any)=>{
		return Joi.object({
			rating: Joi.number().required(),
			comment: Joi.string()
		}).validate(data, this.option);
	}
}

export default Validators

