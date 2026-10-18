const { MongoClient, ServerApiVersion } = require("mongodb");
const { dbUser, dbPassword } = require("./env");

const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.0czr5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const db = client.db("ServiceSharingDB");

const collections = {
    services: db.collection("services"),
    users: db.collection("users"),
    bookings: db.collection("booking"),
};

module.exports = { client, collections };
