const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

var corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:8081", "http://www.altanalyze.org", "https://www.altanalyze.org"]
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json({limit: '2000mb'}));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '2000mb', extended: true}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Oncosplice Web Application backend." });
});

require("./app/routes/cancerdata.routes.js")(app);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});