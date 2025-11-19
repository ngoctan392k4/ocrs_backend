import express from "express"
import cors from 'cors'
import 'dotenv/config';
import pool from './utils/pgConfig.mjs'
import connectPgSimple from 'connect-pg-simple';
import session from "express-session";
import passport from "passport";
import routes from './routes/routes.mjs'

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

const PgSession = connectPgSimple(session);

app.use(
    session({
        secret: "7865d21da14277342855a8443d3b76ef",
        saveUninitialized: false,
        resave: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60000 * 30,
        },
        store: new PgSession({
            pool: pool,
            tableName: 'user_sessions',
        })
    })
);



app.use(passport.initialize());
app.use(passport.session());
app.use(routes);
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
app.get("/", (request, response) => {
    return response.send({msg: "Hello"})
})



