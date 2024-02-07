import { DataTypes, Model } from "sequelize";
import { db } from "../../config/index";
import { user } from "./user.types";
import { Tender } from "../tender.model/tenderSchemma";
import { RatingsAndReviews } from "../ratingAndReviews.model/ratingAndReviewsSchema";



export class User extends Model<user> { }

User.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		salt: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		role: {
			type: DataTypes.ENUM("User", "Admin", "SuperAdmin"),
			defaultValue: "User",
		},
		AccountStatus: {
			type: DataTypes.ENUM("Not Verified", "Pending", "Verified"),
			defaultValue: "Not Verified",
			allowNull: false,
		},
		isMailVerified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		businessEmail: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		phoneNumber: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		businessName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		businessRegNo: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		businessAddress: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		businessDecription: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		rating: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
		},
		totalRaters:{
			type:DataTypes.INTEGER,
			defaultValue :0
		},
		TIN_Number: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		website: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		rToken: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		accountNumber: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isNumeric: true,
			},
		},
		bankName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		profileImage: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		lastSeen:{
			type:DataTypes.DATE,
			defaultValue: Date.now()
		},
		totalAmountEarned: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
		},
		totalAmountSpent: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
		},
		spendingBalance: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
		},
		pendingBalance: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 0,
		},
	},
	{
		tableName: "User",
		sequelize: db,
		paranoid: true,
	}
);

// vendor has many contracts

// vendor has many tenders
User.hasMany(Tender, { as: "tenders", foreignKey: "vendorId" });
Tender.belongsTo(User, { foreignKey: "vendorId" });
// vendor has many reviewsAndRating
User.hasOne(RatingsAndReviews, {
	as: "ratingsAndReviews_Given",
	foreignKey: "giverId",
});
User.hasMany(RatingsAndReviews, {
	as: "ratingsAndReviews_Gotten",
	foreignKey: "receiverId",
});
RatingsAndReviews.belongsTo(User, { as: "ratingsAndReviews" });


export default User


