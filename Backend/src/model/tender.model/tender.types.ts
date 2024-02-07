export interface tender {
	id: string;
	price: number;
	pictureofPreviousJob?: string,
	duration?: number,
	pitch: string;
	isAccepted?: boolean, // if a tender is accepted vendor cannot update it
	vendorid: string;
	contractId: string;
} 

