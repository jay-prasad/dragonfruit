const axios = require('axios');

async function createCase(accessToken, caseData) {
    try {
        const url = 'https://yourinstance.my.salesforce.com/services/data/v52.0/sobjects/Case/';
        const response = await axios.post(url, caseData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create case in Salesforce:', error);
        throw new Error('Failed to create case in Salesforce');
    }
}

module.exports = { createCase };
