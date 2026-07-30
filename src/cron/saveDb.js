const { CronJob } = require('cron');
const ValuesModel = require('../models/value'); // Import Model của bạn
const DeviceHandler = require('../device/deviceHandler');

const deviceHandler = new DeviceHandler();
const saveDb = new CronJob('*/5 * * * * *', async () => {
    try {
        // 1. Lấy dữ liệu từ hàm của bạn
        const valuesMap = await deviceHandler.getValueGroupDevice();
        const snapshotTs = Date.now();
        const snapshotDate = new Date(snapshotTs);

        // 2. Sử dụng Promise.all để lưu tất cả thiết bị đồng thời
        const updatePromises = Object.entries(valuesMap).map(async ([deviceId, tagList]) => {
            // Chuyển đổi tagList thành format mà Schema yêu cầu
            // Schema yêu cầu: [{ tagId: ObjectId, value: Mixed }]
            const formattedTagValues = tagList.map(tag => ({
                tagId: tag._id,
                value: tag.values
            }));

            // 3. Lưu mỗi lần quét thành 1 document riêng để không phình document vượt 16MB
            return await ValuesModel.create({
                deviceId: deviceId,
                date: snapshotDate,
                values: [
                    {
                        ts: snapshotTs,
                        value: formattedTagValues,
                    },
                ],
            });
        });

        // Đợi tất cả hoàn tất
        await Promise.all(updatePromises);
    } catch (err) {
        console.error('❌ Lỗi khi lưu dữ liệu:', err);
    }
});

saveDb.start();
