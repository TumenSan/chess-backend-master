const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const tokenService = require("../service/tokenService");
const UserDto = require("../dtos/userDto");
const ApiError = require("../exceptions/apiError");

class UserService {
  async registration(login, password) {
    const existedUser = await UserModel.findOne({ login });

    if (existedUser) {
      throw ApiError.BadRequest("Пользователь с таким логином уже существует");
    }

    const hashedPassword = await bcrypt.hash(password, 3);
    const user = await UserModel.create({ login, password: hashedPassword });

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    
    await tokenService.saveRefreshToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async login(login, password) {
    const user = await UserModel.findOne({ login });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким логином не найден');
    }
    const isPasswordsEqual = await bcrypt.compare(password, user.password);
    if(!isPasswordsEqual) {
      throw ApiError.BadRequest('Введен неверный пароль');
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    
    await tokenService.saveRefreshToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  //
  async giveup(login) {
    const user = await UserModel.findOne({ login });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким логином не найден');
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    
    await tokenService.saveRefreshToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }
  //

  async logout(refreshToken) {
    const token = await tokenService.removeRefreshToken(refreshToken);

    return token;
  }

  async refreshToken(token) {
    if(!token) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(token);
    const tokenFromDb = await tokenService.findRefreshToken(token);

    if(!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id)
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    
    await tokenService.saveRefreshToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
