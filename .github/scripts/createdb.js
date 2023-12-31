
const fs = require('fs').promises;
const Client = require('pg').Client;

const credentialsRoot =   {
    "user": "postgres",
    "host": "localhost",
    "database": "template1",
    "password": "postgres",
    "port": 5432
}

const credentialsSSB =   {
    "user": "ssb",
    "host": "localhost",
    "database": "ssb",
    "password": "ssb",
    "port": 5432
}

async function setupDatabase() {

const clientRoot = new Client(credentialsRoot);
await clientRoot.connect();
console.log("dropping database ssb if exists.");
await clientRoot.query("DROP DATABASE IF EXISTS ssb;");
console.log("creating ssb user.");
try {
await clientRoot.query("CREATE USER ssb WITH PASSWORD 'ssb';");
} catch (e) {
    console.log(e.message)
}
console.log("creating ssb database.");
await clientRoot.query("CREATE DATABASE ssb;");
console.log(`created database and user ssb.`);
await clientRoot.end();


const clientSSB = new Client(credentialsSSB);
await clientSSB.connect();
console.log("create user");
const data = await fs.readFile("./init.sql", "utf-8");
await clientSSB.query(data);
await clientSSB.end();
}

setupDatabase()