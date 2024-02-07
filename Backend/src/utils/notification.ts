import nodemailer from 'nodemailer'
import {V_ROUTE, mail }from '../config/config'

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user:mail.user ,
        pass: mail.password
    },
    tls: {
        rejectUnauthorized: false
    }
})

export async function sendMail(to: string, html: string, subject: string) {
 
    transporter.sendMail({
        from: `MonieMove <${mail.user}>`,
        to,
        subject,
        html,
    },(error, info) => {
if (error){
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
})
}

export const buildMail = (name: string,template: string, link?:string,token?:string )=>{
    // use Templates here
}
export const emailHtml = (name: string, link?: string ): string => {
    const temp = `
    <div style="background-color: #f5f5f5; padding: 20px; font-family: sans-serif;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to MonieMove</h2>
            <p>Congratulations!! ${name} You're almost set to start using MonieMove App. Just Click the Link Below to verify your account.</p>
            <div style="padding: 10px; background-color: #e0e0e0; text-align: center;">
                <h1 style="color: teal; margin: 0; padding: 0;">CLICK</h1>
                <p>Click the link below to Verif your email<p/>
               
                    <a href="http://localhost:3000/user-account/verification/${link}">
                    <button>VERIFY</button>
                    </a>
            </p>
            <p>Thanks,<br>
            Monie Move App Team</p>
        </div>
    </div>
    `;
    return temp;
}
