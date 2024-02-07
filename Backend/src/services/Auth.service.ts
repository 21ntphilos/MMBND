import {Request,Response, NextFunction} from 'express'
import { OAuth2Client, TokenPayload} from "google-auth-library"
import { cookieAge, google} from '../config/config' 
import { User,user } from '../model/User.model';
import Exception from '../utils/errorHandler';
import { v4 as UUIDV4 } from 'uuid';
import { genToken} from '../utils/generators';
import { emailHtml, sendMail } from '../utils';
import { JwtPayload } from 'jsonwebtoken';
import { cleanRes } from '../utils/cleaner';


class ExternalAuth {
	private gClient = new OAuth2Client(google.clientID,google.clientSecret, google.RedirectUrl);

	public gAuthUpUrl = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {

		const authUrl = this.gClient.generateAuthUrl({
			access_type: "offline",
			scope: ["profile", "email"],
			redirect_uri:google.RedirectUrl
		});
		
		res.redirect(authUrl);

	};

	public googleRedirect = async (
		req: JwtPayload,
		res: Response,
		next: NextFunction
	) => {
		const code = req.query.code as string;
		try {
			const { tokens } = await this.gClient.getToken(code);
			this.gClient.setCredentials(tokens);

			const ticket = await this.gClient.verifyIdToken({
				idToken: tokens.id_token as string,
				audience: google.clientID,
			});

			const payload = ticket.getPayload() as TokenPayload;
			const { sub, email, given_name, family_name, picture } = payload;
			

			const user = (await User.findOne({
				where: { email },
			})) as unknown as user;

				if (user && user.password && user.salt)
					throw new Exception(
						409,
						`Account Already Exist, kindly login to your account with email${email}`
					);
				if (user && user.googleId){
					const token = genToken({
						id: user.googleId!,
						email: email as string,
						isMailVerified:user.isMailVerified,
						AccountStatus:user.AccountStatus
						
					})
					const User = cleanRes(user, ["salt", "password", 'createdAt', 'updatedAt', 'deletedAt'])
					return res.status(200).json({
						token,
						User
					})
					
				}

			const id = UUIDV4();

			const registeredUser = (await User.create({
				id,
				email: email!,
				firstName: given_name!,
				lastName: family_name!,
				profileImage: picture,
				isMailVerified: true,
				googleId: sub
			})) as unknown as user;

			if (!registeredUser) throw new Exception(409, `Account Creation Failed`);

			const token = genToken({
				id: registeredUser.id,
				email: registeredUser.email,
				isMailVerified: registeredUser.isMailVerified,
				AccountStatus: registeredUser.AccountStatus,
			});

			const html = emailHtml(registeredUser.firstName);
			sendMail(registeredUser.email, html, "Welcome to MonieMove,");

			// const { password, salt, ...newUser } =
			// 	registeredUser;

			// res.cookie("token", token, {
			// 	maxAge: cookieAge,
			// 	httpOnly: true,
			// 	secure: true,
			// 	sameSite: true,
			// });

			res.status(201).json({
				message: "Account Created Successfully",
				token,
				registeredUser,
			});
		} catch (error) {
			next(error);
		}
	};
	
}

export default ExternalAuth 