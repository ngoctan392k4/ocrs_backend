import express from "express"
import cors from 'cors'

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})

app.get("/", (request, response) => {
    return response.send({msg: "Hello"})
})