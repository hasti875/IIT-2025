const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: `"OneFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your OneFlow Account - OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to OneFlow!</h1>
              <p>Plan to Bill - Your Project Management Solution</p>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for registering with OneFlow. To complete your registration, please verify your email address using the OTP below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your One-Time Password</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This OTP is valid for <strong>10 minutes</strong></li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
              
              <p>Once verified, you'll have full access to your OneFlow dashboard.</p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; ${new Date().getFullYear()} OneFlow. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: `"OneFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to OneFlow - Account Verified!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to OneFlow!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>Your account has been successfully verified! You're now ready to start managing your projects efficiently.</p>
              
              <h3>What's Next?</h3>
              <div class="feature">
                <strong>📊 Explore Your Dashboard</strong>
                <p>Get insights into your projects, tasks, and team performance</p>
              </div>
              <div class="feature">
                <strong>📁 Create Projects</strong>
                <p>Start organizing your work into manageable projects</p>
              </div>
              <div class="feature">
                <strong>✅ Manage Tasks</strong>
                <p>Break down projects into tasks and track progress</p>
              </div>
              <div class="feature">
                <strong>💰 Track Finances</strong>
                <p>Monitor budgets, invoices, and expenses in one place</p>
              </div>
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} OneFlow. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
