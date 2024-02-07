import {Router} from 'express'
import AdminController from '../controllers/adminControllers'
import { upload } from '../utils';
import { adminAuth } from '../middlewares/adminAuth';

class AdminRouter{
    router;
    Admin = new AdminController()

    constructor(){
        this.router = Router();
        this.initRoutes();
    }

    // all admin Route would be protected with admin auth
    public initRoutes(){
        this.router
                .get("/allUsers", adminAuth, this.Admin.getAllUsers)
                .get("/allContracts", adminAuth,this.Admin.getAllContracts)
                .get("/getAllTransactions",adminAuth, this.Admin.getAllTransaction)
                .get("/transactionReport",adminAuth, this.Admin.transactionReport)
                .get("/totalAmountEarned",adminAuth, this.Admin.TotalAmountEarned)
                .get("/usersReport",adminAuth, this.Admin.usersReport)
                .get("/allTenders", adminAuth,this.Admin.getAllTender)
                .post("/createAdmin", adminAuth, this.Admin.createAdmin)
                .post("/adminCreateUser",adminAuth, this.Admin.adminCreateUser)
                .patch("/makeUserAdmin",adminAuth, this.Admin.upgradeUserToAdmin )
                .patch('/suspendUser',adminAuth, )
                .delete("/cancelContract/:contractId",adminAuth, this.Admin.cancelContract)
                .delete("/deleteAccount",adminAuth, this.Admin.deleteAccount)
                .patch("/releaseMoney/:contractId",adminAuth, this.Admin.releaseMoney)
                    
    }
}

export default AdminRouter