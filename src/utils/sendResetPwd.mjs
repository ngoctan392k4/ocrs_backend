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
  const currentDate = new Date().toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const mailOptions = {
    from: process.env.service_sender,
    to: email,
    subject: "[XYZ Uni] Password Reset Request",
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

        <div style="background-color: #1e3957; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">Password Reset Request</h2>
          <p style="color: #a8b8c9; margin: 5px 0 0;">XYZ University Portal</p>
        </div>

        <div style="padding: 30px;">
          <p>Dear User,</p>
          <p>We received a request to reset the password for your XYZ University Portal account associated with this email address.</p>

          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #666;">Request Time:</td>
                <td style="font-weight: bold; text-align: right;">${currentDate}</td>
              </tr>
              <tr>
                <td style="color: #666;">Status:</td>
                <td style="font-weight: bold; text-align: right; color: #d97706;">Pending Verification</td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0; text-align: center;">
            <p style="color: #666; margin-bottom: 15px;"><strong>Click the button below to reset your password:</strong></p>
            <a href="${resetURL}" style="display: inline-block; background-color: #1e3957; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
              Reset Password
            </a>
            <p style="color: #888; font-size: 13px; margin-top: 15px;">Or copy and paste this link in your browser:</p>
            <p style="color: #1e3957; word-break: break-all; font-size: 12px; background-color: #f9fafb; padding: 10px; border-radius: 4px;">${resetURL}</p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e;"><strong>⚠ Important Security Information:</strong></p>
            <ul style="margin: 10px 0 0; padding-left: 20px; color: #92400e;">
              <li>This link will expire in 10 minutes</li>
              <li>If you did not request this password reset, please ignore this email</li>
              <li>Do not share this link with anyone</li>
              <li>Never give your password to anyone</li>
            </ul>
          </div>

          <p style="margin-top: 30px; font-size: 13px; color: #888;">If you have any questions or did not request this password reset, please contact the IT Support Department.</p>
        </div>

        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          &copy; 2025 XYZ University. All rights reserved.
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

