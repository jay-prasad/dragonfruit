const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load your private key
const privateKeyPath = path.join(__dirname, 'private_key.pem');
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

/**
 * Generates a JWT using the user's email address.
 * @param {string} userEmail - The user's email address.
 * @returns {string} The signed JWT.
 */
function generateJWT(userEmail) {
    const payload = {
        iss: '3MVG9XgkMlifdwVC7HpVYXbtS0.oqrzuNlp6zmZXDWtiIISFV.xfinfE12Ow_cRcE8fvA5eNGRmeZxSCUvXQ2',  // Replace with your actual Consumer Key from the Salesforce connected app
        sub: userEmail,  // User's email address as the subject
        aud: 'https://jpcom-2e-dev-ed.develop.my.salesforce.com',  // Use 'https://test.salesforce.com' for sandbox environments
        exp: Math.floor(Date.now() / 1000) + (3 * 60)  // Token expires in 3 minutes
    };

    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

/**
 * Retrieves a Salesforce access token using the user's email.
 * @param {string} userEmail - The user's email address.
 * @returns {Promise<string>} The Salesforce access token.
 */
async function getSalesforceAccessToken(userEmail) {
    const token = generateJWT(userEmail);
    const data = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`;

    try {
        const response = await axios.post('https://jpcom-2e-dev-ed.develop.my.salesforce.com/services/oauth2/token', data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log("OAuth token received successfully:", response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Salesforce access token using email:', error);
        throw new Error('Failed to retrieve access token from Salesforce');
    }
}

module.exports = { getSalesforceAccessToken };
