import { text } from "express";
import Mailgen from "mailgen";
import nodemailer from "nodemailer"


const sendEmail=async (Options)=>{
    const mailGenerator=new Mailgen({
        theme:'default',
        product:{
            name:"Project_Management",
            link:"https://Project_Management.com"
        }
    })

    const EmailTextual=mailGenerator.generatePlaintext(Options.MailgenContent)
    const EmailHTML=mailGenerator.generate(Options.MailgenContent)

    const transport=nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:Number(process.env.MAILTRAP_SMTP_PORT),
        auth:{
            user:process.env.MAILTRAP_SMTP_USERNAME,
            pass:process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail={
        from:"ProjectManagement@example.com",
        to:Options.email,
        subject:Options.subject,
        html:EmailHTML,
        text:EmailTextual
    }

    try {
        await transport.sendMail(mail)
    } catch (error) {
        console.error("email transportaion Failed")
        console.error('Error',error)
    }
}


const EmailVerificationMailgenContent=(username,VerificationURL)=>{
    return{ 
    body: {
        name: username,
        intro:'Welcome to Our APP! We\'re very excited to have you on board.',
        action:{
                instructions: 'To get started with our APP, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Confirm your account',
                    link: VerificationURL
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const PasswordResetMailgenContent = (username, PasswordResetURL) => {
    return {
        body: {
            name: username,
            intro: "We received a request to reset your password for your account.",

            action: {
                instructions:
                    "Click the button below to reset your password. This link will expire after a limited time for security reasons.",

                button: {
                    color: "#DC4D2F",
                    text: "Reset Password",
                    link: PasswordResetURL
                }
            },

            outro:
                "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged."
        }
    };
};

export{
    EmailVerificationMailgenContent,
    PasswordResetMailgenContent,
    sendEmail
}