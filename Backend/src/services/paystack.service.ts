import Paystack from 'paystack';
import { CLIENT, PaystackSecret, payRef } from '../config/config'
import { 
	Contract,
	 contract, pros, ps, ss } from '../model/contract.model';
import { User, user } from '../model/User.model';
// import { tender } from '../model/tender.model';
import axios from 'axios';
import Exception from '../utils/errorHandler';
import Jobs from "./contract.service"
import { emailHtml, sendMail } from '../utils';
// import UserService from './user.service';


class PayStack {
	// Contract = new Jobs();
	// userService = new UserService();
	Ps = Paystack(PaystackSecret);
	baseRoute = "https://api.paystack.co";

	public payHook = async (body: Paystack.Response) => {
		// use the Job id as the reference
		if (body.event === "charge.success") {
			const contract = (await Contract.update(
				{ paymentStatus: ps.Paid },
				{ where: { id: body.data.reference }, returning: true }
			)) as unknown as [affectedCount: number, affectedRows: contract[]];

			const { vendorId, price } = contract[1][0];

			// cahrge 2% of the fee
			const update = await User.increment(
				["pendingBalance", "totalAmountEarned"],
				{ by: 0.98 * price!, where: { id: vendorId } }
			);
			const vendor = await User.findOne({where :{id:vendorId}}) as unknown as user
			if (!vendor) throw new Exception (404, "Vendor Doesn't Exist")
			// start countdown with duration wheen it neccessary
			// notify vendor of payment
			const emial = emailHtml(vendor.businessName!)
			sendMail(vendor.email, emial, "Notifiction OF Payment")
			// update job paymentStatus to paid and the deliverydate(ie new Date(contract.duration)) of the contract
		} else if (body.event === "charge.failure") {
		}
	};

	public initTransaction = async (
		amount: number,
		email: string,
		jId: string
	) => {
		const job = (await Contract.findOne({
			where: { id: jId },
		})) as unknown as contract;

		if (!job)
			throw new Exception(
				400,
				"This Contract does not exist or Has been deleted"
			);

		const user = (await User.findOne({
			where: { id: job.posterId },
		})) as unknown as user;

		if (job.contractStatus == pros.NA)
			throw new Exception(
				400,
				"Contract has not been Accepted, You cannot pay for UnAccepted"
			);

		const resp = await this.Ps.transaction.initialize({
			amount: job.price! * 100, // convert from Naira to cents
			email: email,
			reference: job.id,
			name: `${user.firstName} from ${user.bankName}`,
			callback_url: CLIENT,
			metadata: JSON.stringify({ jobId: jId }),
		});
		return resp.data.authorization_url;
	};

	public verifyTransaction = async (ref: string) => {
		const T = await axios.get(
			`${this.baseRoute}/transaction/verify/${ref}`,
			{
				headers: {
					Authorization: `Bearer ${PaystackSecret}`,
				},
			}
		);
		if (!T) throw new Exception(400, "Unable to verify transaction ")
		return T.data;
	};
	public makePay = async (reference: string) => {
		const job = (await Contract.findOne({
			where: { id: reference },
		})) as unknown as contract;

		if (job.paymentStatus === ps.Paid) {
			return job;
		}
		const verify = await this.verifyTransaction(job.id);
		if (verify.status === true) return job;

		throw new Exception(400, "Transaction Was not Successful");
	};
	public getListofBanks = async () => {
		const banks = await axios.get(`${this.baseRoute}/bank`, {
			params: {
				country: "nigeria",
				use_cusor: true,
				perpage: 70,
			},
			headers: {
				Authorization: `Bearer ${PaystackSecret}`,
			},
		});
		return banks.data;
	};
	public getAllTransaction = async () => {
		const transactions = await axios.get(
			`${this.baseRoute}/transaction`,
			{ headers: { Authorization: ` Bearer ${PaystackSecret}` } }
		);
		if (!transactions) throw new Exception(400, "unable to Retive transacions");
		return transactions.data;
	};
	//within
	public verifyAccount = async (accNum: string, bank_code: string) => {
		const account = await axios.get(
			`${this.baseRoute}/bank/resolve?account_number=${accNum}&bank_code=${bank_code}`,
			{ headers: { Authorization: ` Bearer ${PaystackSecret}` } }

			);
			console.log(PaystackSecret)
			console.log("VERIFYING ACCOUNT")
			console.log(`ACCOUNT NUMBER:${accNum}`)
			console.log('BANK CODE:',bank_code )

			if (!account) throw new Exception(401, "Unable to Verify account, pls make Sure that the account number Entered is for the Bank Chossen")
			return account
		
	};
	//within
	public getRecipientCode = async (
		name: string,
		accNum: string,
		bankCode: string
	) => {
		const body = JSON.stringify({
			type: "nuban",
			name: `${name}`,
			account_number: `${accNum}`,
			bank_code: `${bankCode}`,
			currency: `NGN`,
		});

		const R = await axios.post(
			`${this.baseRoute}/transferrecipient`,
			body,
			{
				headers: {
					Authorization: ` Bearer ${PaystackSecret}`,
					"Content-Type": "application/json",
				},
			}
		);
			console.log("CREATING RECIPIENT")
		return R.data;
	};
	//within job
	public makeTRansfer = async (Jid: string) => {
		const J = (await Contract.findByPk(Jid)) as unknown as contract;
		if (!J) throw new Exception(400, "unable to fetch Contract");

		const vendor = (await User.findOne({
			where: { id: J.vendorId! },
		})) as unknown as user;

		const body = JSON.stringify({
			source: "balance",
			amount: J.price! * 0.98,
			recipient: vendor.recipientCode,
			reason: `MonieMove Payment For ${J.title}`,
			reference: payRef,
		});

		await axios.post(`${this.baseRoute}/transfer`, body, {
			headers: {
				Authorization: ` Bearer ${PaystackSecret}`,
				"Content-Type": "application/json",
			},
		});
	};

	public checkBalance = async () => {
		axios
			.get(`${this.baseRoute}/balance`, {
				headers: {
					Authorization: `Bearer ${PaystackSecret}`,
				},
			})
			.then((res) => {
				return res.data.data.balance;
			});
	};

	public async getLedger() {
		// this get all the payins and payouts on our Ps account
		axios
			.get(`${this.baseRoute}/balanceledger`, {
				headers: {
					Authorization: `Bearer ${PaystackSecret}`,
				},
			})
			.then((res) => {
				return res.data.data;
			})
			.catch((rej) => {
				throw new Exception(400, rej);
			});
	}


	
}


export default PayStack 
