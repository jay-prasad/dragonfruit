const { getSalesforceAccessToken } = require('./salesforceAuth');

async function testGetAccessToken() {
    const userEmail = 'jaynandan@gmail.com'; // Replace with a valid user email that is configured in Salesforce
    try {
        const accessToken = await getSalesforceAccessToken(userEmail);
        console.log('Access Token:', accessToken);
    } catch (error) {
        console.error('Failed to get access token:', error);
    }
}

testGetAccessToken();
