const env = require("dotenv");
env.config();

const express = require("express");
const app = express();

const utils = require("./utils");

const PORT = process.env.PORT || 3001;

app.get("/organizations/:org/environments/:env/sharedflows/:sharedflow", (req, res) => {
    let host = process.env.MGMT_API_HOST;
    let user = process.env.MGMT_API_USER;
    let password = process.env.MGMT_API_PASS;
    let auth = Buffer.from(user + ":" + password).toString("base64");

    let config = {
        "org": req.params.org,
        "env": req.params.env,
        "sf": req.params.sharedflow,
        "host": host,
        "auth": auth
    };

    utils.getApisUsingSf(config, function (error, response) {
        if (error) {
            console.log(JSON.stringify(error))
            res.status(500).json({ "message": "Something went wrong! Please check logs to find out what went wrong!" });
        } else {
            res.status(200);
            res.json(response);
        }
    });
});

app.all("*", (req, res) => {
    res.status(404);
    res.json({ "message": "Requested resource was not found!" });
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
