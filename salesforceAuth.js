const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load your private key
const privateKeyPath = path.join(__dirname, 'private_key.pem');
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

function generateJWT(federatedId) {
    const payload = {
        iss: '3MVG9XgkMlifdwVC7HpVYXbtS0.oqrzuNlp6zmZXDWtiIISFV.xfinfE12Ow_cRcE8fvA5eNGRmeZxSCUvXQ2',
        sub: federatedId,
        aud: 'https://jpcom-2e-dev-ed.develop.my.site.com',
        exp: Math.floor(Date.now() / 1000) + (3 * 60)
    };

    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

async function getSalesforceAccessToken(federatedId) {
    const token = generateJWT(federatedId);
    const data = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`;

    try {
        const response = await axios.post('https://jpcom-2e-dev-ed.develop.my.site.com/services/oauth2/token', data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Salesforce access token:', error);
        throw new Error('Failed to retrieve access token from Salesforce');
    }
}

module.exports = { getSalesforceAccessToken };
