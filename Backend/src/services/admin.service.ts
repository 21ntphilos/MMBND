import { db } from '../config';
import { User, user } from '../model/User.model';
import { deleteSingleImage, emailHtml, genSalt, hashPassword, sendMail } from '../utils';
import Exception from '../utils/errorHandler';
import Jobs from './contract.service';
import {v4 as UUIDV4} from 'uuid'

class AdminService {
	
	Contract = new Jobs();

	// only accesible to superAdmins only
	public adminCreateUser = async (info: any, role?: "Admin" | "SuperAdmin") => {
		const { email, password, firstName, lastName } = info;

		console.log("GOT HERE SERVICE");
		const user = (await User.findOne({
			where: { email },
		})) as unknown as user;

		if (user) {
			throw new Exception(
				400,
				`Account with Email ${email} Already Exist, kindly Upgrade user to Admin`
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
			role,
			isMailVerified: true,
		})) as unknown as user;

		if (!register) {
			throw new Exception(409, "Account Creation Failed");
		}

		const html = emailHtml(register.firstName!);

		// sendmail
		await sendMail(register.email, html, "Welcome to MonieMove, ");
		// send user
		return register;
	};

	public upgradeUser = async (uId: string, role: "Admin" | "SuperAdmin") => {
		const user = await User.findOne({ where: { id: uId } });
		if (!user) throw new Exception(400, "User does not Exist or Suspended");

		const update = await (await user.update({ role })).reload();

		return update;
	};

	public async registeredUsersReport(param: string) {
		const report = await User.findAll({
			attributes: [
				[db.fn("date_trunc", `${param}`, db.col("createdAt")), `${param}`],
				[db.fn("count", db.col("createdAt")), `total`],
			],
			group: [db.fn("date_trunc", `${param}`, db.col("createdAt"))],
			order: [[db.fn("date_trunc", `${param}`, db.col("createdAt")), "DESC"]],
		});
		return report;
	}
	public deleteAccount = async (uId: string) => {
		const dContract = this.Contract.bulkDeleteContracts(uId);
		const dTenders = this.Contract.bulkDeleteTenders(uId);

		const Anc = await Promise.all([dContract, dTenders]);

		const user = (await User.findOne({
			where: { id: uId },
		})) as unknown as user;

		user.profileImage && deleteSingleImage(user.profileImage);
		await User.destroy({ where: { id: user.id }, force: true });
	};
}

export default AdminService;