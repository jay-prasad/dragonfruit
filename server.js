const express = require('express');
const fs = require('fs');
const saml2 = require('saml2-js');
const path = require('path');
const bodyParser = require('body-parser');

// Define the base directory for certificates and keys
//const baseCertPath = path.join(__dirname, 'my-saml-project');

//console.log(__dirname); 

// Load private key and certificate
const privateKeyPath = path.join('./private_key.pem');
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const certificatePath = path.join('./certificate.pem');
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
const port = 3000;

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
  sp.post_assert(idp, options, (err, samlResponse) => {
    if (err) return res.status(500).send(err);
    // Successful SAML response, proceed with your logic
    // Make sure to confirm the structure of samlResponse to handle it properly
    return res.send(`Hello ${samlResponse.user.name_id}`);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
