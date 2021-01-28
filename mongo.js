const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const tokenKey = '1a2b-3c4d-5e6f-7g8h';
const refreshKey = '3d4f-3c4d-5e6f-7g8h';
const salt = "$2b$10$3ERO2prlA0SetgW9mkBJyO";
const EXP = 5000;

function generateTokens(payload){
    const token = jwt.sign(payload, tokenKey, { algorithm: 'HS512' });
    const [ header, load, signature ] = token.split('.');
    let refreshToken = jwt.sign({signature: signature}, refreshKey);
    refreshToken = bcrypt.hashSync(refreshToken, salt);
    return [token, refreshToken]  
}

function makePayload(find) {
    let tokenExpires = new Date().getTime() + EXP;
    let payload = (function () {
        if (typeof find === 'object'){
            return  {
                uuid: find.uuid,
                exp: tokenExpires
            };
        }

        else if (typeof find === 'string'){
            return  {
                uuid: find,
                exp: tokenExpires
            };
        }
    }());

    let gentokens = generateTokens(payload);
    payload.refresh_token = gentokens[1];

    return [gentokens, payload]
}

const update = async function (collection, find){
    let result = makePayload(find);
    await collection.updateOne({uuid: find.uuid}, {$set: result[1]}, (e)=>{
        if (e) {
            console.log(e.message)
            return {error: "update error"}
        }
    });  
    return {
        access_token: result[0][0],
        refresh_token: Buffer.from(result[0][1]).toString('base64')
    };
}


exports.update = update;

const registration = async function (collection, id){ 
    let result = makePayload(id);
    await collection.insertOne(result[1], (e)=>{
        if (e) {
            console.log(e.message)
            return {error: "registration error"}
        }
    });   
    return {
        access_token: result[0][0],
        refresh_token: Buffer.from(result[0][1]).toString('base64')
    };
}

exports.registration = registration;

const refresh = async function (collection, tokens, find){
    return await jwt.verify(tokens.access_token, tokenKey, async (err) => {
        if (err) return err;

        else {
            let result = makePayload(find);
            await collection.updateOne({uuid: find.uuid}, {$set: result[1]}, (e)=>{
                if (e) {
                    console.log(e.message)
                    return {error: "update error"}
                }
            });   
            return {
                access_token: result[0][0],
                refresh_token: Buffer.from(result[0][1]).toString('base64')
            };
        }

    });
}

exports.refresh = refresh;