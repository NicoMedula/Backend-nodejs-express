export const generateResetEmailTemplate = ({ resetUrl }) => `
<div style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #323232; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #E8E9E7;">
  <div style="background: #fff; border: 3px solid #000; padding: 30px;">
    <h1 style="font-family: 'Space Grotesk', sans-serif; margin: 0 0 20px;">Hakia Platform</h1>
    <h2 style="margin: 0 0 16px;">Password Reset</h2>
    <p>Click the button below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #80DC72; color: #000; text-decoration: none; font-weight: bold; border: 3px solid #000; box-shadow: 4px 4px 0 #000;">
      Reset Password
    </a>
    <p style="color: #666; font-size: 14px;">If you didn't request this, ignore this email.</p>
  </div>
</div>
`;
