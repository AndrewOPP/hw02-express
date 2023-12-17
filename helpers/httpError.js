const messageList = {
  400: "Bad request",
  401: "Unauthorized",
  402: "Forbidden",
  403: "Bad request",
  404: "Not found",
  409: "Conflict",
};

const HttpError = (status, message = messageList[status]) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
export default HttpError;
