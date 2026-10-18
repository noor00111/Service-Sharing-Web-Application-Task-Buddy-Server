const app = require("./src/app");
const { port } = require("./src/config/env");

if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Task Buddy server is running on port ${port}`);
    });
}

module.exports = app;
