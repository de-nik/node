const http = require('http');
const router = require('./router.js');

function mongoConnection(){
    const MongoClient = require('mongodb').MongoClient;
    const client = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });
    client.connect();
    console.log("Connected to mongodb");
    return client;
}

const server = new http.Server();
server.on('request', (request, response) => {
    console.log("User connected to: ", request.url);

    if (request.method == 'POST') {
        response.setHeader('Content-Type', 'application/json');

        let chunks = [];
        request.on('data', chunk => chunks += chunk);

        request.on('end', async () => {  
            let findreq = JSON.parse(chunks);
            let result = await router.route(request, findreq, client);

            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify(result));
            response.end();
        });
    }

    else if (request.method == 'GET' && request.url == '/api/getuid') {
        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        response.end("Your UUID: " + uuidv4())
    }

    else response.end('invalid url') 

});

let client;
server.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
    client = mongoConnection();
});

process.on("SIGINT", () => {
    client.close();
    process.exit();
});