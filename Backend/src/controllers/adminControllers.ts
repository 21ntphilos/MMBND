import { Request, Response, NextFunction } from "express";
// import UserService from "../services/user.service";
import Jobs from "../services/contract.service";
import Exception from "../utils/errorHandler";
import Validator from '../utils/validation'
import AdminService from '../services/admin.service'
import UserController from "./userController";
import PayStack from "../services/paystack.service";
import _ from 'lodash'
import { JwtPayload } from "jsonwebtoken";

class AdminController extends UserController {

	constructor() {
		super();
	}
	contractServices = new Jobs();
	adminService = new AdminService();
	validators = new Validator();
	pay = new PayStack();

	public getAllContracts = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const contracts = await this.contractServices.getAllContracts();
			return res.status(200).json({
				status: "Success",
				Message: "All Contract Gotten Successfully",
				contracts,
			});
		} catch (error) {
			next(error);
		}
	};

	public transactionReport = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const reportData = await this.contractServices.transactionReport(
				req.query.time as string
			);

			return res.status(200).json({
				message: "Success",
				reportData,
			});
		} catch (error) {
			next(error);
		}
	};
	public usersReport = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const reportData = await this.adminService.registeredUsersReport(
				req.query.time as string
			);

			return res.status(200).json({
				message: "Success",
				reportData,
			});
		} catch (error) {
			next(error);
		}
	};

	public getAllTransaction = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const T = await this.pay.getAllTransaction();

			return res.status(200).json({
				message: "Success",
				data:{
					transactions: T.data,
					total: T.meta.total,
					totalVolume:T.meta.total_volume
				}

			});
		} catch (error) {
			next(error);
		}
	};

	public TotalAmountEarned = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const totalAmountEarned = await this.contractServices.totalAmountEarned();

			return res.status(200).json({
				status: "Success",
				totalAmountEarned,
			});
		} catch (error) {
			next(error);
		}
	};

	public bankList = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const resp = await this.pay.getListofBanks();

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

	public getAllTender = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const tenders = await this.contractServices.getAllTender();
			return res.status(200).json({
				message: "Success",
				tenders,
			});
		} catch (error) {
			next(error);
		}
	};
	// createAdmin and Super for superAdmins only it take role as a query param
	public createAdmin = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			  
			if (req.user.role !== "SuperAdmin")
				throw new Exception(
					401,
					"You Don't have Necesarry permissions to meake this request"
				);
			const { error, value } = this.validators.registerValidator(req.body);

			if (error) {
				return res.status(400).json({
					status: "error",
					Error: error.details[0].message,
				});
			}
			const role = req.query.role? req.query.role : "Admin";
			const user = await this.adminService.adminCreateUser(value, role);

			return res.status(201).json({
				status: "success",
				message: "Sign up Successful, Kindly Login into Your Account",
				user,
			});
		} catch (error) {
			next(error);
		}
	};
	public upgradeUserToAdmin = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		try {
			console.log("INITIALIZER", req.user.role)
			if (req.user.role !== "SuperAdmin")
				throw new Exception(
					401,
					"You Don't have Necesarry permissions to meake this request"
				);
				console.log("THESES ARE THEY", req.query.userId,  req.query.role)
			const user = await this.adminService.upgradeUser(
				req.query.userId,
				req.query.role
			);

			return res.status(201).json({
				status: "Success",
				message: "Sign up Successful, Kindly Login into Your Account",
				user,
			});
		} catch (error) {
			next(error);
		}
	};
	//open for admins and super admins
	public adminCreateUser = async (
		req: JwtPayload,
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
			const user = await this.adminService.adminCreateUser(validate.value);

			return res.status(201).json({
				status: "success",
				message:
					"Sign up Successful, User can Login the Account",
			});
		} catch (error) {
			next(error);
		}
	};
	public cancelContract = async(
		req: Request,
		res: Response,
		next: NextFunction
	)=>{
		try {

			await this.contractServices.deleteContract(req.params.contractId)

			return res.status(204).json({
				status: "success",
				message: "Contract Successfully Deleted"
					,
			});
		} catch (error) {
			next(error)
		}
	};
	public deleteAccount = async(	
		req: Request,
		res: Response,
		next: NextFunction
		)=>{
		try {

			const user = await this.adminService.deleteAccount(req.query.id as string)
			
			return res.status(204).json({
				status: "success",
				message: "Contract Successfully Deleted"
			});

		} catch (error) {
			next(error)
		}
	}

	public releaseMoney = async(req: Request,
		res: Response,
		next: NextFunction)=>{
			try {
				await this.pay.makeTRansfer(req.params.contractId);
				return  res.status(200).json({
					message: "A Transfer to Vendor has been Initiated"
				})
			} catch (error) {
				next(error)
			}
	}


	// to remove later
	// public verifyAccount = async (
	// 	req: Request,
	// 	res: Response,
	// 	next: NextFunction
	// ) => {
	// 	try {
	// 		if (!req.query.accNum || !req.query.bn)
	// 			throw new Exception(400, "account number or bankcode missing");

	// 		const account = await this.pay.verifyAccount(
	// 			req.query.accNum as string,
	// 			req.query.bn as string
	// 		);
	// 		return res.status(200).json({
	// 			status: "Success",
	// 			account: account.data,
	// 		});
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// };

	// public RC = async (req: Request, res: Response, next: NextFunction) => {
	// 	try {
	// 		const account = await this.pay.getRecipientCode(
	// 			req.body.name,
	// 			req.body.accNum as string,
	// 			req.body.bn as string
	// 		);

	// 		return res.status(200).json({
	// 			status: "Success",
	// 			account,
	// 		});
	// 	} catch (error) {
	// 		next(error);
	// 	}
	// };
}

export default AdminController