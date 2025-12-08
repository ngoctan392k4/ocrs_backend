import nodemailer from "nodemailer";
import "dotenv/config";

export async function sendInvoiceEmail(email, studentName, orderCode, totalAmount, date, courses) {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.service_host,
      port: process.env.service_port,
      auth: {
        user: process.env.service_user,
        pass: process.env.service_user_pwd,
      },
    });

    const formattedTotal = new Intl.NumberFormat("vi-VN").format(totalAmount);

    // Generate HTML rows for each course
    const courseRows = courses.map(course => {
      const price = new Intl.NumberFormat("vi-VN").format(course.amount);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${course.courseid}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${course.coursename}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${course.credit}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${price}</td>
        </tr>
      `;
    }).join("");

    const mailOptions = {
      from: process.env.service_sender,
      to: email,
      subject: `[XYZ Uni] Payment Confirmation - Order #${orderCode}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          
          <div style="background-color: #1e3957; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">Payment Receipt</h2>
            <p style="color: #a8b8c9; margin: 5px 0 0;">XYZ University Portal</p>
          </div>

          <div style="padding: 30px;">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>This email confirms that your tuition payment has been successfully processed.</p>

            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr>
                  <td style="color: #666;">Order Code:</td>
                  <td style="font-weight: bold; text-align: right;">${orderCode}</td>
                </tr>
                <tr>
                  <td style="color: #666;">Payment Date:</td>
                  <td style="font-weight: bold; text-align: right;">${date}</td>
                </tr>
                 <tr>
                  <td style="color: #666;">Status:</td>
                  <td style="font-weight: bold; text-align: right; color: #14662c;">Payment Successful</td>
                </tr>
              </table>
            </div>

            <h3 style="border-bottom: 2px solid #1e3957; padding-bottom: 10px; color: #1e3957; margin-top: 30px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background-color: #f1f1f1; text-align: left;">
                  <th style="padding: 10px; font-weight: bold;">Code</th>
                  <th style="padding: 10px; font-weight: bold;">Course Name</th>
                  <th style="padding: 10px; font-weight: bold; text-align: center;">Credits</th>
                  <th style="padding: 10px; font-weight: bold; text-align: right;">Amount (VND)</th>
                </tr>
              </thead>
              <tbody>
                ${courseRows}
              </tbody>
            </table>

            <table style="width: 100%; margin-top: 20px; border-top: 2px solid #eee;">
              <tr>
                <td style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                <td style="padding: 10px; text-align: right; width: 120px;">${formattedTotal}</td>
              </tr>
              <tr style="font-size: 16px; background-color: #e6f4ea;">
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #14662c;">Amount Paid:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #14662c;">${formattedTotal}</td>
              </tr>
            </table>

            <p style="margin-top: 30px; font-size: 13px; color: #888;">If you have any questions, please contact the Finance Department.</p>
          </div>
          
          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            &copy; 2025 XYZ University. All rights reserved.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Invoice sent to ${email}`);
  } catch (error) {
    console.error("Error sending invoice email:", error);
  }
}