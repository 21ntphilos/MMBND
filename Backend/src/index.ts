import express, { NextFunction } from 'express'
import {port} from './config/config'
import connectDb from './config'
import Wares from './server'


(async function server(db){
    const app = express()

    new Wares (app)
    await connectDb()

    app.listen(port, ()=>{
        console.log(`Server Listening At Port ${port}`)
    })
    
} )()












// async ()=> {
    
//     app.use(express.json())
// app.use(express.urlencoded({ extended: false }))
// app.use(cookiePaser())

// if (process.env.NODE_ENV = "production") {
//     app.use(cors({
//         origin: ["http://localhost:5500", CLIENT],
//         methods: ["GET", "POST", "PATCH", "DELETE"]
//     }))
// }

// if (process.env.NODE_ENV = "development") {
//     app.use(logger("dev"))
// }

// //Routes
// app.use("/user",userRouter)

// // connect to DB
// await connectDb() 

// app.get("/", (req :Request, res:Response, next:NextFunction) => {
//     return res.status(200).json({
//         message: "Welcome to MonieMove",
//     });
// });

// app.use(ErrorHandler)

// app.listen(port, () => {
//     console.log(`Server Running on Port ${port}`)
// })
