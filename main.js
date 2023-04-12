require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();

const PORT = process.env.PORT || 9000;


mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error)=> console.log(error));
db.once("open", () => console.log("Connected to the database!"));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(
    session({
        secret: "my secret key",
        saveUninitialized: true,
        resave: false,
    })
);
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();

});

//set ejs engine
app.set("view engine", "ejs");

app.use(express.static("uploads"));
//set routes prefix
app.use("", require("./routes/routes"));


app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(PORT, ()=> {
    console.log('Server running at http://localhost:${PORT}');
});