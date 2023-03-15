class UserDto {
  login;
  id;

  constructor(model) {
    this.login = model.login;
    this.id = model._id;
  }
}

module.exports = UserDto;
