const amqp = require("amqplib");
var channelProducer, channelConsumer, connection;

class MqClass {
    async connectQueue() {
        try {
            connection = await amqp.connect("amqp://user1:password1@rabbitmq:5672");
            channelProducer = await connection.createChannel();
            channelConsumer = await connection.createChannel();
            
            // connect to 'back-to-engine', create one if doesnot exist already
            await channelProducer.assertQueue("back-to-engine");
            await channelConsumer.assertQueue("estimation-to-back");
            
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
        let data;
        await channelProducer.consume("estimation-to-back", async (msg) => {
            data = JSON.parse(msg.content.toString());
            console.log("Received message: " + msg.content.toString());

            // Подтверждение обработки сообщения
            await channelProducer.ack(msg);
        });
        return data;
    }
}

module.exports = new MqClass();
