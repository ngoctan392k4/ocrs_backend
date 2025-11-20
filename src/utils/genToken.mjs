import crypto from "crypto"

export const genToken = () => {
    const resetToken = crypto.randomBytes(32).toString("hex");

    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetTokenExpire = new Date(Date.now() + 10 * 60 * 1000);

    return { resetToken, passwordResetToken, passwordResetTokenExpire };
};
