const express = require("express");
//const fs = require("fs");
const app = express();
const cors = require("cors");
jwt = require('jsonwebtoken') //
const tokenKey = '1a2b-3c4d-5e6f-7g8h' //

require('dotenv').config();
const port = process.env.PORT || 5000;
app.use(cors());

const jsonParser = express.json(); //

const mongoose = require("mongoose");

const { check, validationResult } = require('express-validator'); //

const db = ''

mongoose
    .connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((res) => console.log('Connected to DB'))
    .catch((error) => console.log(error));


    const Schema = mongoose.Schema;


    // установка схемы
    const userSchemeSignUp = new Schema({
        login: String,
        password: String,
        email: String
    });
    
    const UserSignUp = mongoose.model("users", userSchemeSignUp);  

//
const mailer = require('./nodemailer')

//let testEmailAccount = await nodemailer.createTestAccount()


//

    
function authenticateToken(req, res, next){
  if (req.headers.authorization) {
    console.log(req.headers.authorization.split(' ')[1]);
    console.log(1);
    jwt.verify(
      req.headers.authorization.split(' ')[1],
      tokenKey,
      (err, payload) => {
        console.log(2);
        if (err) {
          console.log(err);
          console.log(21);
          res.status(404).send();
        }
        else {
            console.log(31);
            if (payload) {
            console.log(32);
            const user = {
              login: payload.login,
              password: payload.password,
            }
            req.user = user;
            
          }
        }
      }
    )
  }
  next();
}

app.get("/me", authenticateToken, async function(req, res){
  user = req.user;
  return res.status(200).json({
    user,
  })
});

app.post("/signup", jsonParser, async function(req, res){
  if(!req.body) return res.sendStatus(400);
  
  console.log(req.body.email);

  const userEmail = req.body.email;
  const userLogin = req.body.login;
  const userPassword = req.body.password;

  try {
    const user = await UserSignUp.find({$or : [{email: userEmail}, {login: userLogin}, {password: userPassword}]});

    if (!(isEmpty(user))){
      return res.status(404).send();
    } else {
        try {

          //'sandanov.tumen.sib@gmail.com'

          const message = {        
              to: userEmail,
              subject: 'Congratulations! You are successfully registred on our site',
              html: `
              <h2>Поздравляем, Вы успешно зарегистрировались на нашем сайте!</h2>
              <i>данные вашей учетной записи:</i>
              <ul>
                  <li>login: ${userLogin}</li>
                  <li>password: ${userPassword}</li>
              </ul>
              `
          }
          let errBool = await mailer(message);
          console.log(600);
          console.log(errBool);
          console.log(600);

          if (errBool){
            //throw 1;
            console.log('error email');
            throw new Error();
          }

          console.log('no error email');

          const userBase = new UserSignUp({
              email: userEmail,
              login: userLogin,
              password: userPassword
          });
          console.log(userEmail);
          //user = {login: userLogin, password: userPassword};

          await userBase.save();
          console.log(userBase);


          //res.send(userBase);
          return res.status(200).json({
            //login: userLogin,
            //password: userPassword,
            token: jwt.sign({login: userLogin, password: userPassword}, tokenKey, { expiresIn: '1h' }),
          })
        }
        catch {
          res.status(404).send();
        }
        
    }
          //console.log(userBase);
          //res.send(userBase);
  }
          
  catch(err) {
      console.log(err);
      res.status(404).send();
  }

});

app.post("/signin", jsonParser, async function(req, res){
  if(!req.body) return res.sendStatus(400);
    
  const userLogin = req.body.login;
  const userPassword = req.body.password;

  try {
    const user = await UserSignUp.find({$and : [{login: userLogin}, {password: userPassword}]});

    if (isEmpty(user)){
      console.log('ErrorUser1');
      //throw new Error(404);
      res.status(404).send();
    } else {
      try{
        const userBase = new UserSignUp({
            login: userLogin,
            password: userPassword
        });
        // отправляем пользователя
        console.log('user signin');

        console.log(userBase);
        //res.send(userBase);

        return res.status(200).json({
          //login: userLogin,
          //password: userPassword,
          token: jwt.sign({login: userLogin, password: userPassword}, tokenKey, { expiresIn: '1h' }),
        })
      }
      catch(err) {
         //res.status(404).send();
         console.log('ErrorUser2', err);
         //throw new Error(404);
         res.status(404).send();
      } 
    }
        
    }catch(err) {
        console.log('ErrorUser3', err);
        //throw new Error(404);
        res.status(404).send();
    }
});

function isEmpty(obj) {
  for (let key in obj) {
    // если тело цикла начнет выполняться - значит в объекте есть свойства
    return false;
  }
  return true;
}



app.listen(process.env.PORT, function(){
  console.log("Сервер ожидает подключения...");
});