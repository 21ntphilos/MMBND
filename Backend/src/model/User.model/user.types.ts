
export interface user {
	id: string;
	password?: string;
	salt?: string;
	role?: string;
	AccountStatus?: string;
	isMailVerified?: boolean;
	email: string; //  req
	firstName: string;
	lastName: string;
	businessEmail?: string;
	phoneNumber?: string; //  req
	businessName?: string; //req
	businessRegNo?: string; //  req
	businessAddress?: string; //required
	businessDecription?: string; //  req
	rating?: number;
	totalRaters?: number;
	accountNumber?: string;
	bankName?: string;
	bankCode?: string;
	recipientCode?: string;
	TIN_Number?: string; // req
	website?: string;
	profileImage?: string;
	rToken?: string;
	googleId?: string;
	totalAmountEarned?: number;
	totalAmountSpent?: number;
	spendingBalance?: number;
	pendingBalance?: number;
	status?: string;
	deletedAt?: Date;
	lastSeen?: Date;
}

