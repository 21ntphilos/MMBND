import bcrypt from 'bcrypt'
import Jwt, { JwtPayload } from "jsonwebtoken"
import { tokenPayload, vTokenPayload } from './typesAndPayloads'
import {jwt }from "../config/config"

export async function genSalt(): Promise<string>{
    return await bcrypt.genSalt(12)
} 

export async function hashPassword(password: string, salt: string) {
    return await bcrypt.hash(password, salt)
}

export async function verifyPass(
	pass: string,
	salt: string,
	inputPass: string
) {
	return (await bcrypt.hash(inputPass, salt)) === pass;
}

export function genToken(payload: tokenPayload) {
    return Jwt.sign(payload,jwt.secret, {expiresIn:jwt.expiresIn})
}

export function verifyToken(token: string) {
    console.log(jwt.secret)
    return Jwt.verify(token, jwt.secret)
}
export function genVerificationToken(payload: vTokenPayload){
    return Jwt.sign(payload,jwt.verificationSecret, {expiresIn: jwt.verificationExpiresIn})
}
export function verifyEmailToken(token:string):JwtPayload | string{
    return Jwt.verify(token, jwt.verificationSecret)
} 

export function adminToken(pl: tokenPayload){
    return Jwt.sign(pl,jwt.adminSecret,{expiresIn:jwt.expiresIn})
}

export function verifyAdmin(token: string) {
	return Jwt.verify(token, jwt.adminSecret);
}
export function refreshToken(rpl: {id :string}){
    return Jwt.sign(rpl, jwt.secret, {expiresIn: jwt.rExpiresIn});
}

