const express = require('express');
const fs = require('fs');
const saml2 = require('saml2-js');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { getSalesforceAccessToken } = require('./salesforceAuth');
const { createCase } = require('./salesforceApi'); // Make sure this module is implemented as described previously

// Load private key and certificate
const privateKeyPath = path.join(__dirname, 'private_key.pem');
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const certificatePath = path.join(__dirname, 'certificate.pem');
const certificate = fs.readFileSync(certificatePath, 'utf8');

// Create service provider
const spOptions = {
  entity_id: "https://jpcom-2e-dev-ed.develop.my.site.com",
  private_key: privateKey,
  certificate: certificate,
  assert_endpoint: "https://jpcom-2e-dev-ed.develop.my.site.com/?so=00Daj000005zjOl",
  allow_unencrypted_assertion: true
};
const sp = new saml2.ServiceProvider(spOptions);

// Create identity provider
const idpOptions = {
  sso_login_url: "https://login.microsoftonline.com/0085be9c-68bc-4bd8-925e-a15a6d413749/saml2",
  sso_logout_url: "https://login.microsoftonline.com/0085be9c-68bc-4bd8-925e-a15a6d413749/saml2/logout",
  certificates: [certificate],
  force_authn: true,
  sign_get_request: false
};
const idp = new saml2.IdentityProvider(idpOptions);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Add session middleware
app.use(session({
  secret: 'very secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: !true }  // Set secure: true in production with HTTPS
}));

// Middleware to parse the body of POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint to login
app.get('/login', (req, res) => {
  sp.create_login_request_url(idp, {}, (err, loginUrl, requestId) => {
    if (err) return res.status(500).send(err);
    return res.redirect(loginUrl);
  });
});

// Endpoint to process the response from identity provider
app.post('/assert', (req, res) => {
  const options = {request_body: req.body};
  sp.post_assert(idp, options, async (err, samlResponse) => {
    if (err) return res.status(500).send(err);

    // Assuming Federated ID is retrieved like this (this will depend on your SAML response structure)
    const federatedId = samlResponse.user.attributes['Federated ID Attribute Name'];

    // Store Federated ID in session
    req.session.federatedId = federatedId;

    return res.send(`Hello ${samlResponse.user.name_id}`);
  });
});

// Endpoint to create a case in Salesforce
app.post('/create-case', async (req, res) => {
  if (!req.session.federatedId) {
    return res.status(401).send('User not authenticated or session expired');
  }

  try {
    const accessToken = await getSalesforceAccessToken(req.session.federatedId);
    const caseData = req.body; // Expects case data to be provided in the request body
    const caseResponse = await createCase(accessToken, caseData);
    res.status(200).json({ message: 'Case created successfully', caseDetails: caseResponse });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ message: 'Failed to create case in Salesforce', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
