function send(cb, content) {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*",
      "Content-Type" : "application/json",
    },
    body: JSON.stringify(content)
  };
  cb(null, response);
}

function error(cb, error) {
  const response = {
    statusCode: 400,
    headers: {
      "Access-Control-Allow-Origin" : "*",
      "Content-Type" : "application/json",
    },
    body: JSON.stringify(error)
  };
  cb(null, response);
}

module.exports = {
  send: send,
  error: error
};
