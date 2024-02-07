import { user, User } from "../model/User.model";
import Exception from "../utils/errorHandler";
import {
	genSalt,
	hashPassword,
	verifyPass,
	genVerificationToken,
	verifyEmailToken,
} from "../utils";
import { v4 as UUIDV4 } from "uuid";
import { emailHtml, sendMail, tokenPayload } from "../utils";
import { loginpayload, pUpdatepayload, registerPayload } from "../utils";
import { contract, Contract } from "../model/contract.model";
import { RatingsAndReviews } from "../model/ratingAndReviews.model";
import { JwtPayload } from "jsonwebtoken";
import PayStack from "./paystack.service";

//validate at the route and logic at services
class UserService {
	private pay = new PayStack();

	public async createUser(info: registerPayload): Promise<user> {
		const { email, password, firstName, lastName } = info;

		const user = (await User.findOne({
			where: { email },
		})) as unknown as user;

		if (user) {
			throw new Exception(
				400,
				`Account Already Exist, kindly login to your account`
			);
		}

		const salt = await genSalt();
		const hash = await hashPassword(password!, salt);
		const register = (await User.create({
			id: UUIDV4(),
			email: email.toLowerCase(),
			password: hash,
			salt,
			firstName,
			lastName,
		})) as unknown as user;

		if (!register) {
			throw new Exception(409, "Account Creation Failed");
		}

		const token = genVerificationToken({
			id: register.id,
			email: register.email,
		});

		const html = emailHtml(register.firstName!, token);

		// sendmail
		await sendMail(register.email, html, "Welcome to MonieMove, ");
		// send user
		return register;
	}
	public verifyEmail = async (token: string) => {
		const verify = verifyEmailToken(token) as JwtPayload;
		if (!verify) throw new Exception(400, "Link Expired");

		const user = (await User.findOne({
			where: { id: verify.id },
		})) as unknown as user;

		// if (!user) throw new Exception(404, 'User not found')
		if (user.isMailVerified) throw new Exception(200, "Email already verified");

		const update = (await User.update(
			{ isMailVerified: true },
			{ where: { id: user.id }, returning: true }
		)) as unknown as [affectedCount: number, affectedRows: user[]];
		if (!update) throw new Exception(409, "Unable to Verify User");
		return update[1][0];
	};
	public async login(login: loginpayload) {
		const { email, password } = login;

		const user = (await User.findOne({
			where: { email: email.toLowerCase() },
			include: [
				{ model: Contract, as: "posted_contracts", foreignKey: "posterId" },
				{
					model: Contract,
					as: "executed_contracts",
					foreignKey: "vendorId",
				},
			],
		})) as unknown as user;

		if (!user) throw new Exception(400, "User not found");

		const verify = await verifyPass(user.password!, user.salt!, password!);

		if (!verify) throw new Exception(400, "Invalid Email or Password");

		if (!user.isMailVerified) {
			const token = genVerificationToken({ id: user.id, email: user.email });
			const html = emailHtml(user.businessName!, token);
			await sendMail(user.email, html, "Verify Email");

			throw new Exception(
				400,
				`Email not Verified, Kindly Check ${user.email} to verify your Email`
			);
		}

		return user;
	}

	public changePassword = async (info: any, userinfo: user) => {
		const { currentPassword, newPassword } = info;
		const { id } = userinfo;

		const user = (await User.findOne({ where: { id } })) as unknown as user;
		if (!user) throw new Exception(401, "User Not Found");

		const verify = await verifyPass(
			user.password!,
			user.salt!,
			currentPassword
		);

		if (verify) {
			return this.resetPassword(user, newPassword);
		} else {
			throw new Exception(
				401,
				"Incorrect Current Password, Pls Input  your Current password Correctly"
			);
		}
	};
	public async forgotPassword(pl: { email: string }) {
		const user = (await User.findOne({
			where: { email: pl.email },
		})) as unknown as user;
		if (!user) throw new Exception(409, "User Does not exist");

		if ((user.email && !user.password) || !user.salt)
			throw new Exception(
				409,
				"Seems your account was created through third party, try Login in through Google or FaceBook"
			);

		// generate a token and send it to the user's mail
		const token = genVerificationToken({
			id: user.id,
			email: user.email,
		});

		// send mail to user
		const html = emailHtml(user.businessName!, token);
		const subject = "Reset Password";
		await sendMail(user.email, html, subject);
	}
	public async resetPassword(user: user, newPassword: string) {
		const newsalt = await genSalt();
		const hash = await hashPassword(newPassword, newsalt);

		const updatedUser = await User.update(
			{ password: hash, salt: newsalt },
			{ where: { id: user.id } }
		);
		if (!updatedUser) throw new Exception(409, "Unable to Reset Password");
		return updatedUser;
	}
	public async getUserById(id: string): Promise<user> {
		return (await User.findOne({
			where: { id },
			attributes: [
				"id",
				"role",
				"AccountStatus",
				"isMailVerified",
				"email",
				"firstName",
				"lastName",
				"businessEmail",
				"phoneNumber",
				"businessName",
				"businessRegNo",
				"businessAddress",
				"businessDecription",
				"rating",
				"TIN_Number",
				"website",
				"profileImage",
				"totalAmountEarned",
				"totalAmountSpent",
				"spendingBalance",
				"pendingBalance",
				"deletedAt",
				"createdAt",
				"lastSeen",
			],
		})) as unknown as user;
	}

	public async updateProfile(
		pl: pUpdatepayload,
		user: tokenPayload,
		profileImage?: string
	) {
		const { id } = user;
		const toBeUpdated = (await User.findOne({
			where: { id },
		})) as unknown as user;
		const someOne = `${toBeUpdated.firstName} ${toBeUpdated.lastName}`;

		// use the bank name to get the bankCode
		// const verify = await this.pay.verifyAccount(pl.accountNumber, pl.bankCode);
		// if (!verify)
		// 	throw new Exception(
		// 		400,
		// 		"Unable to Verify Your Acount pls make Sure your Account number matched the BAnk Code"
		// 	);

		// // create a reciepient for the user and update the user reciepient
		// const Rcode = await this.pay.getRecipientCode(
		// 	someOne,
		// 	pl.accountNumber,
		// 	pl.bankCode
		// );
		// if (!Rcode) throw new Exception(400, "Unable to Create Recipient Code");

		const update = (await User.update(
			{
				...pl,
				AccountStatus: "Verified",
				profileImage,
			},
			{ where: { id }, returning: true }
		)) as unknown as [affectedCount: number, affectedRows: user[]];

		if (!update) throw new Exception(409, "Unable to Update Profile");

		const updatedUser = update[1][0];

		return updatedUser;
	}
	public async getAllUsers() {
		return await User.findAll({
			attributes: [
				"id",
				"role",
				"AccountStatus",
				"isMailVerified",
				"email",
				"firstName",
				"lastName",
				"businessEmail",
				"phoneNumber",
				"businessName",
				"businessRegNo",
				"businessAddress",
				"businessDecription",
				"rating",
				"TIN_Number",
				"accountNumber",
				"bankName",
				"website",
				"profileImage",
				"totalAmountEarned",
				"totalAmountSpent",
				"spendingBalance",
				"pendingBalance",
				"deletedAt",
				"lastSeen",
				"createdAt",
			],
		});
	}

	public reviewRates = async (pl: any, uId: string, jId: string) => {
		const Job = (await Contract.findOne({
			where: { id: jId },
		})) as unknown as contract;
		if (!Job) throw new Exception(404, "Contract Not Found");

		if (Job.posterId !== uId)
			throw new Exception(
				401,
				"UNAUTHORISED!! Sorry you cannot review this Contract"
			);

		const rNr = RatingsAndReviews.create({
			id: UUIDV4(),
			rating: pl.rating,
			comment: pl.review,
			contractId: jId,
			giverId: uId,
			receiverId: Job.vendorId,
		});

		const user = (await User.findOne({
			where: { id: Job.vendorId },
		})) as unknown as user;
		if (!user) throw new Exception(402, "User not Found");
		const rating =
			(user.rating! * user.totalRaters! + pl.rating) / (user.totalRaters! + 1);
		const update = User.update(
			{
				rating: rating,
				totalRaters: user.totalRaters! + 1,
			},
			{ where: { id: Job.vendorId } }
		).then(() => {
			console.log("updated rating");
		});

		return rNr;
	};

	public async lastSeenUpdate(id: string) {
		return User.update({ lastSeen: new Date() }, { where: { id } });
	}
}

export default UserService;
