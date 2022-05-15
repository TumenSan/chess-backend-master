const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        // Пожалуйста, используйте свой собственный gmail аккаунт для рассылки
        auth: {
            user: 'chess.project.256@gmail.com', // (замените звездочики на название вашего почтового ящика gmail) 
            pass: 'myproject256' // (замените звездочики на название вашего почтового ящика) 
        }
    },
    {
        from: 'Mailer Test <chess.project.256@gmail.com>' // (замените звездочики на название вашего почтового ящика gmail) 
    }
)


const mailer = async (message) => {
    result = await transporter.sendMail(message, (err, info) => {
        if(err) {
            console.log(err, 'HELP');
            //throw new Error();
            return 1;
        }
        console.log('Email sent: ', info)
        return 0;
    })
    return result;
}

module.exports = mailer