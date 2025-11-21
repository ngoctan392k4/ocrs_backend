import nodemailer from "nodemailer";
import "dotenv/config";

export async function sendResetPasswordEmail(email, resetToken){
  let transporter = nodemailer.createTransport({

    // For email google ....
    // service: process.env.service,
    // auth: {
    //   user: process.env.service_mail,
    //   pass: process.env.service_pwd,
    // },
    host: process.env.service_host,
    port: process.env.service_port,
    auth: {
      user: process.env.service_user,
      pass: process.env.service_user_pwd,
    },
  });

  const resetURL = `http://localhost:5173/resetPassword?token=${resetToken}`;

  const mailOptions = {
    from: process.env.service_sender,
    to: email,
    subject: "Reset your password in XYZ University Portal",
    html: `
      <p>We received your request to reset your account password.</p>
      <p>Please click the link below and follow the instructions to change your password:</p>
      <a href="${resetURL}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

