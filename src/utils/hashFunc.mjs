import bcrypt from "bcrypt";
const saltRounds = 12;

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};


export const comparePassword = async (plain, hashed) => {
    return await bcrypt.compare(plain, hashed);
};