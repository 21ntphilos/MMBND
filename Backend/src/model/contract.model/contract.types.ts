export interface contract {
	id: string;
	title: string;
	description: string;
	location?: string;
	image?: string;
	specifications?: string;
	price?: number;
	quantity?: number;
	minPrice: number; // should be a price range client can pay
	maxPrice: number;
	duration?: number;
	completed?: boolean;
	paymentStatus?: ps;
	contractStatus?: pros;
	DeliveryDate?:Date
	shipmentStatus?: ss;
	tenderId?: string; // updated to the tender that is accepted
	posterId: string; // a poster has many jobs
	vendorId?: string; //a vendor has many jobs
	// reviewAndRating // a job has one review and rating
}

export enum pros {
	NA = "Not Accepted",
	Accepted = "Accepted",
	Ongoing = "Ongoing",
	Completed = "Completed",
	Closed = "Closed",
}

export enum ps {
	NP = "Not Paid",
	Paid = "Paid",
	Refunded = "Refunded",
	Disbursed = "Disbursed",
	Failed = "Failed",
	Reversed = "Reversed",
}

export enum ss {
	shipped = "Shipped",
	NS = "Not Shipped",
	Received = "Received",
	Returned = "Returned",
}
