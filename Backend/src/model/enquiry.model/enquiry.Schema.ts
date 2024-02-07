import { DataTypes, Model } from "sequelize";
import { db } from "../../config";
import { enquiry } from "./enquiry.types";

export class Enquiry extends Model<enquiry>{}

Enquiry.init({
    id: {
        type:DataTypes.UUID,
        primaryKey:true,
        unique: true,
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    message:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    response:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    status:{
        type: DataTypes.ENUM,
        values:["Open", "Closed"],
        defaultValue: "Open",
        allowNull: false,
    },
},{
    tableName: "Enquiry",
    sequelize:db
})