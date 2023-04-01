const amqp = require("amqplib");
var channelProducer, channelConsumer, connection, connection2;

class MqClass {
    async connectQueue() {
        try {
            connection = await amqp.connect("amqp://user1:password1@rabbitmq:5672");
            channelProducer = await connection.createChannel();
            
            // connect to 'back-to-engine', create one if doesnot exist already
            await channelProducer.assertQueue("back-to-engine");
            
        } catch (error) {
            console.log(error)
        }
    }

    async sendData (data) {
        console.log(data);
        // send data to queue
        await channelProducer.sendToQueue("back-to-engine", Buffer.from(JSON.stringify(data)));
            
        // close the channel and connection
        //await channel.close();
        //await connection.close();
    }

    async startConsume () {
        console.log("Start consuming messages...");
        await channelProducer.consume("back-to-engine", async (msg) => {
            const data = JSON.parse(msg.content.toString());
            console.log("Received message: " + msg.content.toString());

            // Подтверждение обработки сообщения
            await channelProducer.ack(msg);
        });
    }
}

module.exports = new MqClass();
