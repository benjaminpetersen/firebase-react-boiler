const fs = require("fs");

fs.rmSync("./web-client-build", {force: true})
fs.symlinkSync("../web-client/build", "./web-client-build", "dir");