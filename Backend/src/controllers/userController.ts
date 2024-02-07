import { Request, Response, NextFunction } from 'express'
import UserService from "../services/user.service"
import Jobs from "../services/contract.service"
import Validator from '../utils/validation'
import { genToken, refreshToken, verifyToken } from '../utils/generators'
import Exception from '../utils/errorHandler'
import { PaystackSecret, cookieAge} from '../config/config'
import { JwtPayload } from 'jsonwebtoken'
import crypto from 'crypto'
import PayStack from '../services/paystack.service'
import { contract } from '../model/contract.model'
import _ from 'lodash'
import { user } from '../model/User.model'
import axios from 'axios'


class UserController {
	userService: UserService = new UserService();
	contractServices = new Jobs();
	paystack = new PayStack();
	validators = new Validator();

	public registerUser = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const validate = this.validators.registerValidator(req.body);
			if (validate.error) {
				return res.status(400).json({
					status: "error",
					Error: validate.error.details[0].message,
				});
			}
			const user = await this.userService.createUser(validate.value);

			return res.status(201).json({
				status: "success",
				message: "Sign up Successful, Pls Check Your Mail to verify Your mail",
			});
		} catch (error) {
			next(error);
		}
	};

	// protected route
	public verifyEmail = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const user = await this.userService.verifyEmail(
				req.params.token || req.query.token
			);

			const pl = {
				id: user.id,
				email: user.email,
				businessName: user.businessName,
				role: user.role,
				isMailVerified: user.isMailVerified,
				AccountStatus: user.AccountStatus,
			};
			const rToken = refreshToken({ id: user.id });
			const token = genToken(pl);

			res.cookie("rToken", rToken, {
				maxAge: cookieAge,
				httpOnly: true,
				sameSite: "none",
				secure: true,
			});

			return res.status(200).json({
				status: "Success",
				message: "Email Verification Successful Kindly login",
				token,
				user,
			});
		} catch (error) {
			next(error);
		}
	};

	public login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validate = this.validators.loginValidator(req.body);
			if (validate.error)
				throw new Exception(409, validate.error.details[0].message);

			const user = await this.userService.login(validate.value);
			const pl = {
				id: user.id,
				email: user.email,
				businessName: user.businessName,
				role: user.role,
				isMailVerified: user.isMailVerified,
				AccountStatus: user.AccountStatus,
			};
			const rToken = refreshToken({ id: user.id });
			const token = genToken(pl);

			res.cookie("rToken", rToken, {
				maxAge: cookieAge,
				httpOnly: true,
				sameSite: "none",
				secure: true,
				// domain: [CLIENT]
			});

			return res.status(200).json({
				meassage: "Login Successful",
				token,
				user,
			});
		} catch (error) {
			next(error);
		}
	};
	//Protected
	public changePassword = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const validate = this.validators.changePassValidator(req.body);
			if (validate.error)
				throw new Exception(409, validate.error.details[0].message);

			const changePass = await this.userService.changePassword(
				validate.value,
				req.user
			);

			res.status(200).json({
				meassage: "Password Changed Successfully",
			});
		} catch (error) {
			next(error);
		}
	};

	public forgotPassword = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const validate = this.validators.emailValidator(req.body);
			if (validate.error)
				throw new Exception(409, validate.error.details[0].message);

			const reset = await this.userService.forgotPassword(validate.value);

			return res.status(200).json({
				Message: "Check Your Email for Password Reset Link",
			});
		} catch (error) {
			next(error);
		}
	};
	//Protected
	public resetPassword = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const validate = this.validators.resetPassValidator(req.body);
			await this.userService.resetPassword(req.user, validate.value);

			return res.status(201).json({
				status: 201,
				Message: "Password Reset Successful",
			});
		} catch (error) {
			next(error);
		}
	};
	//Protected
	public updateProfile = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const validate = this.validators.pUpdateValidator(req.body);
			if (validate.error)
				throw new Exception(400, validate.error.details[0].message);

			const user = await this.userService.updateProfile(
				validate.value,
				req.user,
				req.file?.path
			);

			const pl = {
				id: user.id,
				email: user.email,
				isMailVerified: user.isMailVerified,
				role: user.role,
				AccountStatus: user.AccountStatus,
			};

			const token = genToken(pl);

			return res.status(200).json({
				status: "Update Successful ",
				message: "Profile Updated Successfully",
				token,
				user,
			});
		} catch (error) {
			next(error);
		}
	};
	public refreshtoken = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.cookies && req.cookies.rToken) {
				const verify = verifyToken(req.cookies.rToken) as JwtPayload;
				if (!verify) throw new Exception(401, "invalid token");

				const user = await this.userService.getUserById(verify.id);
				if (!user) throw new Exception(400, "User Does not Exist");

				this.userService.lastSeenUpdate(verify.id);

				const pl = {
					id: user.id,
					email: user.email,
					businessName: user.bankName,
					AccountStatus: user.AccountStatus,
					isMailVerified: user.isMailVerified,
					role: user.role,
				};

				const token = genToken(pl);

				return res.status(200).json({
					message: "Success",
					token,
					user,
				});
			} else {
				return res.status(400).json({
					message: "you are Logged out, Kindly Log in",
				});
			}
		} catch (error) {
			next(error);
		}
	}; 
	public logout = async (req: Request, res: Response, next: NextFunction) => {
		try {
			res.clearCookie("rToken");

			return res.status(200).json({
				status: "success",
				message: "Logout Successful",
			});
		} catch (error) {
			next(error);
		}
	};

	// Admin
	public getAllUsers = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const users = (await this.userService.getAllUsers()) as unknown as user[];

			res.status(200).json({
				status: "Success",
				users,
			});
		} catch (error) {
			next(error);
		}
	};
	public getUserById = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const user = await this.userService.getUserById(req.params.userId);
			res.status(200).json({
				status: "Success",
				user,
			});
		} catch (error) {
			next(error);
		}
	};

	// protected
	public getContractById = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const contract = await this.contractServices.getContractById(
				req.params.contractId
			);
			res.status(200).json({
				status: "Success",
				contract,
			});
		} catch (error) {
			next();
		}
	};
	public getTenderById = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const tender = await this.contractServices.getTenderById(
				req.params.tenderId
			);
			res.status(200).json({
				status: "Success",
				tender,
			});
		} catch (error) {
			next();
		}
	};
	public postContract = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.user.AccountStatus !== "Verified")
				throw new Exception(
					401,
					"You cannot post a Contract, pls Update your profile to a business Account to Post Contract"
				);

			const validate = this.validators.contractValidator(req.body);
			if (validate.error)
				throw new Exception(409, validate.error.details[0].message);

			let job: contract;
			job = await this.contractServices.createContract(
				validate.value,
				req.user,
				req.file?.path
			);

			return res.status(201).json({
				status: 201,
				Message: "Contract Created Successfully",
				job,
			});
		} catch (error) {
			next(error);
		}
	};
	public updateContract = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const id = req.params.contractId;
			const attachment = req.file;

			console.log(req.body);
			const { value, error } = this.validators.updateContractValidator(
				req.body
			);
			if (error) throw new Exception(409, error.details[0].message);

			const update = await this.contractServices.updateContract(
				value,
				id,
				req.user,
				req.file?.path
			);
			return res.status(200).json({
				status: "Success",
				Message: "Contract Updated Successfully",
				update,
			});
		} catch (error) {
			next(error);
		}
	};
	public makeTender = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			if (req.user.AccountStatus !== "Verified")
				throw new Exception(
					401,
					"You cannot Make a Tender, pls Update your profile to enable you make a tender to this contract "
				);

			const { error, value } = this.validators.tenderValidator(req.body);
			if (error) throw new Exception(409, error.details[0].message);

			const contractId = req.params.contractId;

			const tender = await this.contractServices.makeTender(
				value,
				contractId,
				req.user,
				req.file.path
			);

			if (tender) {
				return res.status(201).json({
					status: "Success",
					tender,
				});
			}
		} catch (error) {
			next(error);
		}
	};
	public updateTender = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const { error, value } = this.validators.tenderUpdatedValidator(req.body);
			if (error) throw new Exception(409, error.details[0].message);

			const tender = await this.contractServices.updateTender(
				value,
				req.params.tenderId,
				req.user.id
			);

			if (tender) {
				return res.status(201).json({
					status: "Success",
					message: "Contract Updated Successfully",
					tender,
				});
			}
		} catch (error) {
			next(error);
		}
	};
	//protected
	public getVendorContracts = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const contracts = await this.contractServices.getVendorContracts(
				req.params.id || req.user.id
			);
			return res.status(200).json({
				status: "Success",
				Message: "Vendor Contracts Gotten Successfully",
				contracts,
			});
		} catch (error) {
			next(error);
		}
	};
	public getPosterContracts = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const contracts = await this.contractServices.getPosterContracts(
				req.params.id || req.user.id
			);
			return res.status(200).json({
				status: "Success",
				Message: "Poster Contracts Gotten Successfully",
				contracts,
			});
		} catch (error) {
			next(error);
		}
	};

	//open
	public getAvalaibleContracts = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const contracts = await this.contractServices.getAvalaibleContracts();
			return res.status(200).json({
				status: "Success",
				Message: "All Available Contracts Gotten Successfully",
				contracts,
			});
		} catch (error) {
			next(error);
		}
	};
	public getAllCompletedContracts = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const contracts = await this.contractServices.getAllCompletedContracts();
			return res.status(200).json({
				status: "Success",
				Message: "All Completed Contracts Gotten Successfully",
				contracts,
			});
		} catch (error) {
			next(error);
		}
	};
	public AllCompletedContractsByVendor = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const contracts =
				await this.contractServices.getAllCompletedContractsByVendor(
					req.params.vendorId || req.user.id
				);
			return res.status(200).json({
				status: "success",
				contracts,
			});
		} catch (error) {
			next(error);
		}
	};
	//protected
	public acceptTender = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			console.log("This is Query", req.query);

			const tenderId = req.query.tenderId as string;
			const contractId = req.query.contractId as string;

			const update = await this.contractServices.acceptTender(
				contractId,
				tenderId
			);
			if (update) {
				return res.status(201).json({
					status: "Success",
					message: "Tender Accepted Successfully",
					update,
				});
			}
		} catch (error) {
			next(error);
		}
	};
	public markcomplete = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const contractId = req.params.contractId;
			const update = await this.contractServices.markcomplete(contractId);
			if (update) {
				return res.status(201).json({
					status: "Success",
					message: "Contract Marked Complete Successfully",
					update,
				});
			}
		} catch (error) {
			next(error);
		}
	};
	public markReceived = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
		} catch (error) {
			next(error);
		}
	};
	public reviewRates = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			const { error, value } = this.validators.rateVendor(req.body);
			if (error) throw new Exception(400, error.details[0].message);

			const review = await this.userService.reviewRates(
				value,
				req.user.id,
				req.query.contractId
			);
			if (review) {
				return res.status(201).json({
					status: "Success",
					message: "Rating Successful",
				});
			}
		} catch (error) {
			next(error);
		}
	};
	public bankList = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const resp = await this.paystack.getListofBanks();

			const banks = _.map(resp.data, (bn) => {
				return { id: bn.id, name: bn.name, code: bn.code };
			});

			return res.status(200).json({
				message: "Success",
				banks,
			});
		} catch (error) {
			next(error);
		}
	};
	public payHook = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const hash = crypto
				.createHmac("sha512", PaystackSecret)
				.update(JSON.stringify(req.body))
				.digest("hex");
			if (hash === req.headers["x-paystack-signature"]) {
				this.paystack.payHook(req.body);
			}
			res.send(200);
			return;
		} catch (error) {
			next(error);
		}
	};
	public handlePay = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			// await this.paystack.makePay(req.query.reference!)
		} catch (error) {
			next(error);
		}
	};

	public recipientList = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const R = await axios.get(`https://api.paystack.co/transferrecipient`, {
				headers: {
					Authorization: ` Bearer ${PaystackSecret}`,
					"Content-Type": "application/json",
				},
			});
			return res.status(200).json({
				message:'success',
				Recipints : R.data
			})
		} catch (error) {
			next(error);
		}
	};
}

export default UserController

