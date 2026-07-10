const mqtt = require('mqtt');
const { logger } = require('../../config/loggerConfig');
const TagnameModel = require('../../models/tagname');

function MqttHandler(device, deviceHandler) {
    this.device = device;
    this.deviceHandler = deviceHandler; // Reference to update this.datas
    this.client = null;
    this.status = false;
    this.tags = [];

    this.connect = async () => {
        return new Promise((resolve, reject) => {
            const { config } = this.device;
            //URL giúp MQTT Client xác định giao thức và địa chỉ để kết nối tới MQTT
            const brokerUrl = config.host.includes('://') ? config.host : `mqtt://${config.host}`;
            const options = {
                port: Number(config.port) || 1883,
                username: config.username,
                password: config.password,
                clientId: config.clientId || `ems_${this.device._id}`,
                connectTimeout: 5000,
                reconnectPeriod: 0, // We want deviceHandler to manage reconnect
            };

            const client = mqtt.connect(brokerUrl, options);
            let isResolved = false;

            client.on('connect', async () => {
                if (isResolved) return;
                isResolved = true;
                logger.info(`[MQTT] Connected to broker for device ${this.device.deviceName}`);
                this.client = client;
                this.status = true;

                try {
                    // Fetch tags for this device
                    this.tags = await TagnameModel.find({ deviceId: this.device._id }).lean();
                    const topics = this.tags.map(t => t.address).filter(Boolean);
                    if (topics.length > 0) {
                        client.subscribe(topics, (err) => {
                            if (err) {
                                logger.error(`[MQTT] Subscription error for ${this.device.deviceName}:`, err);
                            } else {
                                logger.info(`[MQTT] Subscribed to topics: ${topics.join(', ')}`);
                            }
                        });
                    }
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            client.on('message', (topic, message) => {
                try {
                    const payload = message.toString();
                    logger.info(`[MQTT] Nhận dữ liệu từ topic "${topic}": ${payload}`);
                    // Find tag matching the topic (address)
                    const tag = this.tags.find(t => t.address === topic);
                    if (tag) {
                        let val = parseFloat(payload);
                        if (isNaN(val)) {
                            // If not a number, maybe try parsing JSON or keep as string
                            try {
                                val = JSON.parse(payload);
                            } catch {
                                val = payload;
                            }
                        } else {
                            // Apply gain and offset if applicable
                            if (tag.gain !== undefined && tag.offset !== undefined) {
                                val = val * tag.gain + tag.offset;
                            }
                        }
                        this.deviceHandler.datas[tag._id.toString()] = val;
                    }
                } catch (err) {
                    logger.error(`[MQTT] Message handling error:`, err);
                }
            });

            client.on('error', (err) => {
                logger.error(`[MQTT] Error for ${this.device.deviceName}: ${err.message}`);
                if (!isResolved) {
                    isResolved = true;
                    reject(err);
                }
            });

            client.on('close', () => {
                logger.warn(`[MQTT] Connection closed for ${this.device.deviceName}`);
                this.status = false;
                // Update status in deviceHandler
                const deviceStatus = this.deviceHandler.connectionDevice.find(c => c.deviceId === this.device._id.toString());
                if (deviceStatus && deviceStatus.connected) {
                    deviceStatus.connected = false;
                    this.tags.forEach(t => this.deviceHandler.datas[t._id.toString()] = null);
                    this.deviceHandler.connect(this.device._id.toString());
                }
            });
        });
    };

    this.close = () => {
        if (this.client) {
            try {
                this.client.end(true, () => logger.info(`[MQTT] Connection ended for ${this.device.deviceName}`));
            } catch (e) {
                logger.error('Close error:', e.message);
            }
        }
    };
}

module.exports = MqttHandler;
