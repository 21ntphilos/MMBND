import { DataTypes, Model } from "sequelize";
import {db} from "../../config/index";
import { reviewAndRating } from "./ratingAndReviews.types";
import { allow } from "joi";


export class RatingsAndReviews extends Model<reviewAndRating>{}

RatingsAndReviews.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Response:{
        type: DataTypes.STRING,
        allowNull: true
    }, 
    contractId:{
        type: DataTypes.UUID,
        allowNull:false
    },
    giverId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: true
    },
}, {
    sequelize: db,
    tableName: "ReviewAndRating"
})
