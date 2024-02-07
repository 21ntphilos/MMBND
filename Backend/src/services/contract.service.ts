import { Contract, contract, pros, ps, ss } from "../model/contract.model";
import { v4 as UUIDV4 } from "uuid";
import { user } from "../model/User.model";
import Exception from "../utils/errorHandler";
import { Tender, tender } from "../model/tender.model";
import {
	bulkImageDelete,
	deleteSingleImage,
	emailHtml,
	sendMail,
	tokenPayload,
} from "../utils";
// import sequelize, { Sequelize } from "sequelize/types/sequelize";
import { db } from "../config";
import UserService from "./user.service";
import { Op } from "sequelize";
import { RatingsAndReviews } from "../model/ratingAndReviews.model";

class Jobs {
	User = new UserService();

	public async createContract(info: any, user: tokenPayload, image?: string) {
		// if (!user.AccountStatus)
		// 	throw new Exception(
		// 		401,
		// 		"You cannot post a Contract, pls Update your profile to a business Account to Post Contract"
		// 	);

		const contract = (await Contract.create({
			id: UUIDV4(),
			posterId: user.id,
			image,
			...info,
		})) as unknown as contract;
		if (!contract) throw new Exception(409, "Error Creating Contract");
		return contract;
	}
	public async updateContract(
		info: any,
		id: string,
		user: user,
		image: string
	): Promise<Contract> {
		const contract = (await Contract.findOne({
			where: { id },
		})) as unknown as contract;

		if (!contract) throw new Exception(404, "Contract Not Found");
		if (contract.posterId !== user.id)
			throw new Exception(
				401,
				"UNAUTHORISED!! Sorry you do not have the permission to update this Contract"
			);

		const update = await Contract.update(
			{ ...info, image },
			{ where: { id }, returning: true }
		);
		if (!update) throw new Exception(409, "Error Updating contact");

		return update[1][0];
	}
	public async makeTender(
		info: any,
		contractId: string,
		user: user,
		pictureofPreviousJob?: string
	): Promise<tender> {
		const { price, pitch, duration } = info;

		// if (!user.AccountStatus)
		// 	throw new Exception(
		// 		401,
		// 		"You cannot Make a Tender, pls Update your profile to enable you make a tender to this contract "
		// 	);

		const J = (await Contract.findOne({
			where: { id: contractId },
		})) as unknown as contract;

		if (price > J.maxPrice || price < J.minPrice)
			throw new Exception(409, "Price out of range with Contract Price");

		const tender = (await Tender.create({
			id: UUIDV4(),
			price,
			pitch,
			pictureofPreviousJob,
			contractId,
			duration,
			vendorid: user.id,
		})) as unknown as tender;

		const poster = await this.User.getUserById(J.posterId);

		if (!tender) throw new Exception(400, "Error in making tender");

		const email = emailHtml(poster.businessName!);
		const subject = `Tender made for${J.title}`;
		sendMail(poster.email, email, subject);
		return tender;
	}

	public acceptTender = async (Jobid: string, tenderId: string) => {
		const J = (await Contract.findOne({
			where: { id: Jobid },
		})) as unknown as contract;

		const T = (await Tender.findOne({
			where: { id: tenderId },
		})) as unknown as tender;

		if (J.vendorId === T.vendorid) {
			throw new Error("This Tender has already been accepted");
		}

		const job = await Contract.update(
			{
				vendorId: T.vendorid,
				price: T.price * J.quantity!,
				duration: T.duration ? T.duration : J.duration,
				contractStatus: pros.Accepted,
			},
			{ where: { id: Jobid }, returning: true }
		);

		const vendor = await this.User.getUserById(T.vendorid);
		const email = emailHtml(vendor.businessName!);
		const subject = `Congratulations, Tender for ${J.title} Accepted!!`;
		sendMail(vendor.email, email, subject);

		return job[1][0];
	};
	public async getVendorContracts(id: string): Promise<Contract[]> {
		const contracts = await Contract.findAll({ where: { vendorId: id } });
		if (!contracts) throw new Exception(404, "Error Fetching Vendor Contracts");
		return contracts;
	}
	public async getAllContracts(): Promise<contract[]> {
		const contracts = (await Contract.findAll({})) as unknown as contract[];
		if (!contracts) throw new Exception(404, "Error Fetching Contracts");
		return contracts;
	}
	public async getAvalaibleContracts(): Promise<contract[]> {
		const contracts = (await Contract.findAll({
			where: { contractStatus: pros.NA },
		})) as unknown as contract[];
		if (!contracts) throw new Exception(404, "Error Fetching Contracts");
		return contracts;
	}
	public async getPosterContracts(Uid: string): Promise<contract[]> {
		const contracts = (await Contract.findAll({
			where: { posterId: Uid },
			include: {
				model: Tender,
				as: "Bid",
			},
		})) as unknown as contract[];
		if (!contracts) throw new Exception(404, "Error Fetching Contracts");
		return contracts;
	}
	public async updateTender(
		update: tender,
		id: string,
		Uid: string
	): Promise<Tender> {
		const tender = (await Tender.findOne({
			where: { id },
		})) as unknown as tender;

		if (!tender) throw new Exception(404, "Tender Not Found");
		if (tender.vendorid !== Uid)
			throw new Exception(
				401,
				"UNAUTHORISED!! Sorry you cannot update this Tender"
			);

		const Update = await Tender.update(
			{ ...update },
			{ where: { id }, returning: true }
		);
		return Update[1][0];
	}
	public async getContractById(id: string): Promise<contract> {
		return (await Contract.findOne({ where: { id } })) as unknown as contract;
	}
	public async getTenderById(id: string): Promise<tender> {
		return await Tender.findByPk(id) as unknown as tender;
	}

	public async getAllCompletedContracts(): Promise<contract[]> {
		const contracts = (await Contract.findAll({
			where: {
				[Op.and]: [
					{ shipmentStatus: ss.Received },
					{ contractStatus: pros.Closed },
				],
			},
		})) as unknown as contract[];

		if (!contracts) throw new Exception(404, "Error Fetching Contracts");

		return contracts;
	}
	public async getAllCompletedContractsByVendor(
		vendorId: string
	): Promise<contract[]> {
		const contracts = (await Contract.findAll({
			where: { contractStatus: pros.Closed, vendorId },
		})) as unknown as contract[];
		if (!contracts) throw new Exception(404, "Error Fetching Contracts");
		return contracts;
	}
	public async getAllTender() {
		return await Tender.findAll();
	}
	public async getAllTenderByVendor(id: string) {
		return (await Tender.findAll({
			where: { vendorid: id },
		})) as unknown as tender[];
	}
	public async totalAmountTransacted() {
		const amount = await Contract.sum("price", {
			where: { paymentStatus: ps.Paid },
		});

		return amount === null ? 0 : amount;
	}
	public async transactionReport(param: string) {
		const transactions = await Contract.findAll({
			attributes: [
				[db.fn("date_trunc", `${param}`, db.col("createdAt")), `${param}`],
				[db.fn("sum", db.col("price")), "amount"],
			],
			where: { paymentStatus: ps.Paid },

			group: [db.fn("date_trunc", `${param}`, db.col("createdAt"))],
			order: [[db.fn("date_trunc", `${param}`, db.col("createdAt")), "DESC"]],
		});
		return transactions;
	}

	public async markcomplete(id: string) {
		const contract = await Contract.findOne({ where: { id } });

		if (!contract) throw new Exception(404, "Contract Not Found");

		contract.set({ completed: true, contractStatus: pros.Completed });
		return await contract.save();
	}
	public async markReceived(id: string) {
		const contract = await Contract.findOne({ where: { id } });

		if (!contract) throw new Exception(404, "Contract Not Found");

		contract.set({ completed: true, shipmentStatus: ss.Received });
		return await contract.save();
	}

	public totalAmountEarned = async () => {
		const amount = await this.totalAmountTransacted();
		return amount * 0.02;
	};
	public async deleteContract(id: string) {
		const contract = (await Contract.findOne({
			where: { id },
		})) as unknown as contract;
		deleteSingleImage(contract.image!);

		return await Contract.destroy({ where: { id } });
	}
	public bulkDeleteContracts = async (pid: string) => {
		const images: string[] = [];
		const PtdContracts = await this.getPosterContracts(pid);
		PtdContracts.forEach((c) => {
			c.image && images.push(c.image);
		});
		await bulkImageDelete(images);

		return await Contract.destroy({ where: { posterId: pid }, force: true });
	};
	public bulkDeleteTenders = async (uId: string) => {
		const images: string[] = [];

		const uTenders = await this.getAllTenderByVendor(uId);

		uTenders.forEach((t) => {
			t.pictureofPreviousJob && images.push(t.pictureofPreviousJob);
		});

		await bulkImageDelete(images);

		return await Tender.destroy({ where: { vendorid: uId }, force: true });
	};
}

export default Jobs;
