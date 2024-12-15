import { DotenvConfig } from "../config/env.config";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
interface IMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class MailService {
  transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly from: string;
  constructor() {
    this.from = DotenvConfig.MAIL_FROM;
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: +process.env.MAIL_PORT!,
      secure: false,
      requireTLS: true,
      auth: {
        user: DotenvConfig.MAIL_USERNAME,
        pass: DotenvConfig.MAIL_PASSWORD,
      },
    });
  }
  async sendMail({ to, html, subject, text }: IMailOptions) {
    try {
      
      const mailOptions = {
        from: this.from,
        text,
        to,
        html,
        subject,
      };
      const send = await this.transporter.sendMail(mailOptions);
      return send;
    } catch (error) {
      console.log("🚀 ~ MailService ~ sendMail ~ error:", error)
      
    }
  }
}
