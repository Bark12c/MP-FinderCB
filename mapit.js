
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const postcode = event.queryStringParameters.postcode;

  if (!postcode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing postcode' }),
    };
  }

  const url = `https://mapit.mysociety.org/postcode/${encodeURIComponent(postcode)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
