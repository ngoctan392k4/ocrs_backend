import bcrypt from "bcrypt"
import passport from "passport";
import { Strategy } from "passport-local";
import { hashPassword, comparePassword } from "../utils/hashFunc.mjs";
import pool from "../utils/pgConfig.mjs"

passport.serializeUser((user, done) => {
    done(null, user.accountid);
})

passport.deserializeUser(async (accountid, done) => {
    try {
        const matchUser = await pool.query("SELECT * FROM get_account_by_id($1)", [accountid]);
        const user = matchUser.rows[0];


        if(user){
            done(null, user)
        }else {
            done(new Error("User Not Found", null));
        }

    } catch (error) {
        done(error, null);
    }
});

export default passport.use(
    new Strategy(async (username, password, done) => {
        if(username === null || password === null) return done(null, false, { message: 'Username and Password are required' })


        try {
            const matchUser = await pool.query("SELECT * FROM get_account_by_username($1)", [username])
            const user = matchUser.rows[0];


            if(!user){
                return done(null, false, { message: 'Username Not Found' });
            }

            const matchPassword = await comparePassword(password, user.password);

            if(!matchPassword){
                return done(null, false, { message: 'Incorrect Password' });
            }

            return done(null, user);

        } catch (error) {
            return done(error);
        }
    })
)

