import { DataTypes, Model } from "sequelize";
import { db } from "../../config/index";
import { User } from "../User.model";

class VendorImages extends Model{}

VendorImages.init(
	{
		id:{
            type:DataTypes.STRING,
            primaryKey: true,
            unique:true            
        },
		userid: {
            type:DataTypes.STRING,
            allowNull:false,

        },
		image:{type:DataTypes.STRING,
        allowNull: false
        },
	},
	{
		sequelize: db,
		tableName: "vendorsImages",
	}
);

User.hasMany(VendorImages,{as: "Images", foreignKey: "userid"})
VendorImages.belongsTo(User,{as: "Vendor", foreignKey: "userid"})