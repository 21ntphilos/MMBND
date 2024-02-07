import { user } from "../model/User.model";

export type tokenPayload = Pick<
	user,
	"id" | "email" | "businessName" | "role" | "AccountStatus" | "isMailVerified"
>;
export type vTokenPayload = { id: string; email: string };
export type registerPayload = Pick<
	user,
	| "email"
	| "password"
	| "salt"
	| "phoneNumber"
	| "businessName"
	| "firstName"
	| "lastName"
>;
export type userResponse = Omit<user, "Password" | "salt">;
export type loginpayload = Pick<user, "email" | "password">;

export type pUpdatepayload = {
	businessEmail: string;
	phoneNumber: string;
	businessRegNo: string;
	businessName: string;
	businessAddress: string;
	businessDecription: string;
	TIN_Number: string;
	bankCode: string;
	accountNumber: string;
	bankName: string;
	profileImage: string;
	website: string;
};
