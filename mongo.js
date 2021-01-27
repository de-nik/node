const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const tokenKey = '1a2b-3c4d-5e6f-7g8h';
const refreshKey = '3d4f-3c4d-5e6f-7g8h';
const salt = "$2b$10$3ERO2prlA0SetgW9mkBJyO";
const EXP = 1000;

function generateTokens(payload){
    const token = jwt.sign(payload, tokenKey);
    const [ header, load, signature ] = token.split('.');
    let refreshToken = jwt.sign({signature: signature}, refreshKey);
    refreshToken = bcrypt.hashSync(refreshToken, salt);
    return [token, refreshToken]
}

const update = async function (collection, find){
    let tokenExpires = new Date().getTime() + EXP;
    payload = {
        uuid: find.uuid,
        exp: tokenExpires
    };
    
    gentokens = generateTokens(payload);
    payload.refresh_token = gentokens[1];

    await collection.updateOne({uuid: find.uuid}, {$set: payload}); 
    
    return {
        access_token: gentokens[0],
        refresh_token: Buffer.from(gentokens[1]).toString('base64')
    };
}

exports.update = update;

const registration = async function (collection, id){ 
    let tokenExpires = new Date().getTime() + EXP;
    let payload = {
        uuid: id,
        exp: tokenExpires
    }
        
    gentokens = generateTokens(payload);
    payload.refresh_token = gentokens[1];

    await collection.insertOne(payload, (err) => {   
        if(err) return {error: "registration error"}
    });    

    return {
        access_token: gentokens[0],
        refresh_token: Buffer.from(gentokens[1]).toString('base64')
    };
}

exports.registration = registration;

const refresh = async function (collection, tokens, find){
    return await jwt.verify(tokens.access_token, tokenKey, async (err) => {
        if (err) return err;

        else {
            let tokenExpires = new Date().getTime() + EXP;
            let payload = {
                uuid: find.uuid,
                exp: tokenExpires
            };

            gentokens = generateTokens(payload);
            payload.refresh_token = gentokens[1];

            await collection.updateOne({uuid: find.uuid}, {$set: payload}); 
            
            return {
                access_token: gentokens[0],
                refresh_token: Buffer.from(gentokens[1]).toString('base64')
            };

        }
    });
}

exports.refresh = refresh;