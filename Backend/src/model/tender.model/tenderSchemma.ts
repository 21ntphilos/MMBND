import { DataTypes, Model } from "sequelize";
import { tender } from "./tender.types";
import {db} from "../../config";
import { User } from "../User.model/userSchema";

export class Tender extends Model<tender>{ }

Tender.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
    },
    price:  {
        type: DataTypes.FLOAT,
        allowNull: false
    }, 
    pictureofPreviousJob:  {
        type: DataTypes.STRING,
        allowNull: true
    },
    pitch: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    isAccepted:{
        type:DataTypes.BOOLEAN,
        defaultValue : false
    },
    vendorid: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    contractId:{
        type: DataTypes.UUID,
        allowNull:false
    }
}, {
    sequelize: db,
    tableName: "Tender"
})

// tender belongs to a user
// Tender.belongsTo(User, { foreignKey: "vendorId" });