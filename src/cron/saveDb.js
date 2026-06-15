const { CronJob } = require('cron');
const ValuesModel = require('../models/value'); // Import Model của bạn
const DeviceHandler = require('../device/deviceHandler');

const deviceHandler = new DeviceHandler();
const saveDb = new CronJob('*/5 * * * * *', async () => {
    try {
        // 1. Lấy dữ liệu từ hàm của bạn
        const valuesMap = await deviceHandler.getValueGroupDevice();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // 2. Sử dụng Promise.all để lưu tất cả thiết bị đồng thời
        const updatePromises = Object.entries(valuesMap).map(async ([deviceId, tagList]) => {
            // Chuyển đổi tagList thành format mà Schema yêu cầu
            // Schema yêu cầu: [{ tagId: ObjectId, value: Mixed }]
            const formattedTagValues = tagList.map(tag => ({
                tagId: tag._id,
                value: tag.values
            }));

            // 3. Thực hiện lưu vào DB bằng $push
            return await ValuesModel.findOneAndUpdate(
                {
                    deviceId: deviceId,
                    date: { $gte: startOfDay }
                },
                {
                    $push: {
                        values: {
                            ts: Date.now(),
                            value: formattedTagValues // Mảng các tag đã được format
                        }
                    },
                    $setOnInsert: { date: new Date() } // Chỉ set date khi tạo mới
                },
                { upsert: true, new: true }
            );
        });

        // Đợi tất cả hoàn tất
        await Promise.all(updatePromises);
    } catch (err) {
        console.error('❌ Lỗi khi lưu dữ liệu:', err);
    }
});

saveDb.start();