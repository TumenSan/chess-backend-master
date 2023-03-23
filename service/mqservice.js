const amqp = require("amqplib");
var channel, connection;

class MqClass {
    async connectQueue() {
        try {
            connection = await amqp.connect("amqp://user1:password1@localhost:5672");
            channel = await connection.createChannel()
            
            // connect to 'test-queue', create one if doesnot exist already
            await channel.assertQueue("test-queue")
            
        } catch (error) {
            console.log(error)
        }
    }

    async sendData (data) {
        console.log(data);
        // send data to queue
        await channel.sendToQueue("test-queue", Buffer.from(JSON.stringify(data)));
            
        // close the channel and connection
        //await channel.close();
        //await connection.close();
    }
}

module.exports = new MqClass();
