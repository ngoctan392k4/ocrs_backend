import bcrypt from "bcrypt";

const saltRound = 20;

export const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRound);
    return bcrypt.hashSync(password, salt);
};

export const comparePassword = (plain, hashed) => {
    return bcrypt.compareSync(plain, hashed);
};
