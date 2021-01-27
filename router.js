const crypto = require('crypto');
const mongoroute = require('./mongo.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const refreshKey = '3d4f-3c4d-5e6f-7g8h';

const route = async function route(request, req, client){
    const collection = client.db("usersdb").collection("users");

    if (request.url == '/api/gettoken') {
        if (typeof req.uuid === 'undefined' || Object.keys(req).length > 1) 
            return {error: "invalid request"};

        else {
            let findreq = req;
            const find = await collection.findOne(findreq);
            if (find) return await mongoroute.update(collection, find);
            return await mongoroute.registration(collection, req.uuid);
        }
    }

    else if (request.url == '/api/refresh') {
        if (typeof req.refresh_token === 'undefined' || typeof req.access_token === 'undefined' || Object.keys(req).length > 2) 
            return {error: "invalid request"};

        else {       
            let findreq = {refresh_token: Buffer.from(req.refresh_token, 'base64').toString('ascii')};
            const find = await collection.findOne(findreq);

            if (find) {
                const [ header, load, signature ] = req.access_token.split('.');
                let refreshToken = jwt.sign({signature: signature}, refreshKey);

                if (bcrypt.compareSync(refreshToken, find.refresh_token))
                    return await mongoroute.refresh(collection, req, find);
                else
                    return {error: "invalid pair"};
            }
            return {error: "invalid pair"};
        }
    }

    return {error: "error"};
}

exports.route = route;