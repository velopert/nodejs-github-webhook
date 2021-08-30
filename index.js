const http = require("http");
const { spawn } = require("child_process");
const crypto = require("crypto");
const { URL } = require("url");

const secret = "secret"; // secret key of the webhook
const port = 8081; // port

http
  .createServer(function (req, res) {
    console.log("request received");

    const path = req.url;
    let data;

    if (path != "/push" || req.method != "POST") {
      res.writeHead(400, { "Content-Type": "application/json" });
      data = JSON.stringify({ error: "invalid request" });

      return res.end(data);
    }

    let jsonString = "";
    req.on("data", function (data) {
      jsonString += data;
    });

    req.on("end", function () {
      const hash =
        "sha1=" +
        crypto.createHmac("sha1", secret).update(jsonString).digest("hex");

      if (hash != req.headers["x-hub-signature"]) {
        console.log("invalid key");

        res.writeHead(400, { "Content-Type": "application/json" });
        data = JSON.stringify({ error: "invalid key", key: hash });

        return res.end(data);
      }

      console.log("running hook.sh");

      const deploySh = spawn("sh", ["hook.sh"]);
      deploySh.stdout.on("data", function (data) {
        const buff = new Buffer.from(data);

        console.log(buff.toString("utf-8"));
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      data = JSON.stringify({ success: true });

      return res.end(data);
    });
  })
  .listen(port);

console.log("Server listening at " + port);
