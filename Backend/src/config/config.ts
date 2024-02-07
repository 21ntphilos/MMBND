
import dotenv from 'dotenv'
dotenv.config({debug: true})


export const CLIENT = process.env.FRONTEND_URL!
export const port = process.env.PORT || 5111;
export const DB_URL = process.env.DB_URL!;
export const V_ROUTE =
	process.env.V_ROUTE! || "http://localhost:3000/user-account/verification"

        console.log(V_ROUTE)

export const jwt = {
    verificationSecret: process.env.VERIFICATION_SECRET! || "turugo&%E^LOTA",
    secret: process.env.APP_SECRET! || 'moniemove',
    expiresIn: process.env.JWT_EXPIRES_IN! || '1d',
    verificationExpiresIn: process.env.JWT_VERIFICATION_EXPIRES_IN! || '10m',
    adminSecret: process.env.ADMIN_SECRET! || "no83u98n9[098092j2)#@(($J3084he90384hn34498e",
    rExpiresIn: process.env.REXPIRES_IN!
};


export const mail = { 
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: process.env.MAIL_PORT || 587,
        user: process.env.MAIL_USER || '',
        password: process.env.MAIL_PASSWORD || ''
}

export const mailTemplate = {
	welcome: process.env.WELCOME_TEMP,
	passordReset: process.env.PASSWORD_RESET_TEMP,
	changePassword: process.env.CHANGE_PASSWORD_TEMP,
	verifyPassword: process.env.VERIFY_EMAIL,
};
export const RedisUrl = process.env.REDIS_URL!
export const cookieAge = process.env.COOKIE_AGE as unknown as number || 604800000

export const Cloudinary = {
    cloudName:process.env.CLOUDINARY_CLOUD_NAME,
    API_key:process.env.CLOUDINARY_API_KEY,
    API_Secret:process.env.CLOUDINARY_API_SECRET
}

export const google = {
	clientID: process.env.GOOGLE_CLIENT_ID!,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
	RedirectUrl: process.env.GOOGLE_REDIRECT_URL!,
}

export const PaystackSecret = process.env.PAYSTACK_SECRET!
export const payRef = process.env.PAYSTACK_REFERENCE; 

