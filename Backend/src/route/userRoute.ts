import { Router } from "express";
import UserController from "../controllers/userController";
import { userAuth } from "../middlewares/userAuth";
import { upload } from "../utils/multer";
import ExternalAuth from "../services/Auth.service";

class UserRouter {
	user = new UserController();
	Auth = new ExternalAuth();
	router;

	constructor() {
		this.router = Router();
		this.initRoutes();
	}
	public initRoutes() {
		this.router
			.post("/signUp", this.user.registerUser)
			.get("/verifyEmail/:token", this.user.verifyEmail)
			.post("/login", this.user.login)
			.post("/logout", this.user.logout)
			.patch("/changePassword", userAuth, this.user.changePassword)
			.post("/forgotPassword", this.user.forgotPassword)
			.post("/resetPassword", this.user.resetPassword)
			.patch(
				"/updateProfile",
				userAuth,
				upload.single("profileImage"),
				this.user.updateProfile
			)
			.get("/authGoogle", this.Auth.gAuthUpUrl)
			.get("/google-auth-redirect", this.Auth.googleRedirect)
			.post(
				"/postContract",
				userAuth,
				upload.single("image"),
				this.user.postContract
			)
			.patch(
				"/updateContract/:contractId",
				userAuth,
				upload.single("image"),
				this.user.updateContract
			)
			.patch("/acceptTender", userAuth, this.user.acceptTender)
			.get("/getUserById/:userId", this.user.getUserById)
			.get("/getContractById/:contractId", this.user.getContractById)
			.get("/getTenderById/:tenderId", this.user.getTenderById)
			.get("/getVendorContracts/:id", userAuth, this.user.getVendorContracts)
			.get("/getPosterContracts/:id", userAuth, this.user.getPosterContracts)
			.get("/getAvalaibleContracts", this.user.getAvalaibleContracts)
			.get("/getAllCompletedContracts", this.user.getAllCompletedContracts)
			.get(
				"/getAllCompletedContractsByVendor/:vendorId",
				userAuth,
				this.user.AllCompletedContractsByVendor
			)
			.get("/getContractWithTenders/:contractId")
			.post("/payHook", userAuth, this.user.handlePay)
			.post(
				"/makeTender/:contractId",
				userAuth,
				upload.single("pictureofPreviousJob"),
				this.user.makeTender
			)
			.patch("/updateTender/:tenderId", userAuth, this.user.updateTender)
			.post("/makeReviewrates", userAuth, this.user.reviewRates)
			.get("/refreshToken", this.user.refreshtoken)
			.get("/bankList", this.user.bankList)
			.patch("/markComplete/:contractId", userAuth, this.user.markcomplete)
			.patch("/markReceived/:contractId", userAuth, this.user.markReceived)
			.get("/recipientList", this.user.recipientList);

	}
}

export default UserRouter;
