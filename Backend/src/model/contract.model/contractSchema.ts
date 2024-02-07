import { DataTypes, Model } from "sequelize";
import { contract } from "./contract.types";
import { db } from "../../config";
import { Tender } from "../tender.model/tenderSchemma";
import { User } from "../User.model/userSchema";

export class Contract extends Model<contract> {}

Contract.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			unique: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		location: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		specifications: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		price: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
		},
		quantity: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
		},
		minPrice: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		maxPrice: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		duration: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		completed: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		paymentStatus: {
			type: DataTypes.ENUM,
			values:["Not Paid", "Paid","Pending", "Refunded","Disbursed", "Failed", "Reversed"],
			defaultValue: "Not Paid",
		},
		contractStatus: {
			type: DataTypes.ENUM,
			values:[
				"Not Accepted",
				"Acepted",
				"Ongoing",
				"Completed",
				"Closed"
			],
			defaultValue: "Not Accepted",
		},
		DeliveryDate:{
			type:DataTypes.DATE,
			allowNull: true
		},
		shipmentStatus: {
			type: DataTypes.ENUM,
			values:["Shipped", "Not Shipped", "Received", "Returned"],
			defaultValue: "Not Shipped",
		},
		posterId: {
			type: DataTypes.UUID,
			allowNull: true,
		},
		vendorId: {
			type: DataTypes.UUID,
			allowNull: true,
		},
	},
	{
		tableName: "Contract",
		sequelize: db,
	}
);

Contract.hasMany(Tender, { as: "Bid", foreignKey: "contractId" });
Tender.belongsTo(Contract, { as: "Contract", foreignKey: "contractId" });

User.hasMany(Contract, { as: "executed_contracts", foreignKey: "vendorId" });
User.hasMany(Contract, { as: "posted_contracts", foreignKey: "posterId" });
Contract.belongsTo(User);

export default Contract;
