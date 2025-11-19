import { Router } from "express";
import {
  query,
  validationResult,
  body,
  matchedData,
  checkSchema,
} from "express-validator";
import passport from "passport";
import './local-stategies.mjs'

const router = Router();

router.post("/api/auth", (request, response, next) => {
    passport.authenticate('local', (error, user, info) => {

        // Process sever connection error
        if(error) {
            return next(error)
        }

        if(!user){
            return response.status(401).json(info)
        }

        request.logIn(user, async (error) => {
            if(error) {
                return next(error)
            }

            const userInfo = {
                id: user.accountid,
                username: user.username,
                role: user.role
            }

            return response.status(200).json(userInfo)
        })
    })(request, response, next);
});

router.get("/api/check-session", (request, response) => {
    if(request.user){
        return response.json({loggedIn: true, user: request.user})
    }

    response.json({loggedIn: false});
});

export default router;