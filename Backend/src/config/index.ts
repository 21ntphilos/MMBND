export * as config from "./config";
import { Sequelize } from "sequelize";
import { DB_URL } from "./config";

export const db = new Sequelize(DB_URL, {logging: false});

const connectDb = async () => {
	try {
		// { alter: true }
		db.sync({ alter: true })
			.then(() => {
				console.log("Database Connected Successfully", DB_URL);
			})
			.catch((error) => {
				console.error(error);
			});
	} catch (error) {
		console.error(error);
	}
};

export default connectDb;
