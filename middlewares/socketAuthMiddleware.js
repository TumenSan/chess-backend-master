const ApiError = require("../exceptions/apiError");
const tokenService = require("../service/tokenService");
const url = require("url");

function socketAuthMiddleware(req, next) {
  try {
    const accessToken = url.parse(req.url, true).query.token;
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    next(null, userData);
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}

module.exports = socketAuthMiddleware;
