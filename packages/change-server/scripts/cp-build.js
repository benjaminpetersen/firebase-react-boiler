const fs = require("fs");

if(fs.existsSync("./web-client-build")) fs.rmSync("./web-client-build");
fs.cpSync("../web-client/build", "./web-client-build", {
  recursive: true,
});
