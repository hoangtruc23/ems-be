const { CronJob } = require('cron')
const path = require('path')
const moment = require('moment-timezone')
const fs = require('fs')
const readline = require('readline')

const writeFtp = require('../ftp/writeFtp')
const DeviceHandler = require('../device/deviceHandler')
const TagnameModel = require('../models/tagname')
const ConfigFtpModel = require('../models/configFtp')
const { logger } = require('../config/loggerConfig')
const uploadFile = require('../ftp/uploadFtp')
const {
    ftpConstant,
    fileNameFtpConstant,
    ftpGetValue,
} = require('../utils/constant/ftpConstant')

//Ghi 1 phút 1 lần vào file Daily
const writeFtpCron = new CronJob('0 */1 * * * *', async () => {
    try {
        const deviceHandler = new DeviceHandler()
        const tagnameValues = deviceHandler.datas
        const tagnames = ftpConstant
        const tagnameGetValue = ftpGetValue
        const tagnameAll = [...tagnames, ...tagnameGetValue]
        const names = tagnameAll.map((tag) => tag.name)
        const tagnameDB = await TagnameModel.find({
            name: { $in: names },
        })
            .select({ _id: 1, name: 1 })
            .lean()
        const foundNames = new Map(tagnameDB.map((d) => [d.name, d]))
        const tagnamesInfo = names.map((name) => {
            if (foundNames.has(name)) {
                return foundNames.get(name) // có trong DB
            } else {
                return { _id: null, name } // trả về _id null
            }
        })

        const ids = tagnamesInfo.map((doc) => ({
            _id: doc._id ? doc._id.toString() : null,
            name: doc.name,
        }))

        const computedMap = {
            //TÍNH SUM
            bessSoc: (values, tagname) =>
                ((values[tagname.get('pcs1BmsSoc')?._id.toString()] ?? 0) +
                    (values[tagname.get('pcs2BmsSoc')?._id.toString()] ?? 0)) /
                2,
            bessSoH: (values, tagname) =>
                ((values[tagname.get('pcs1StateOfHealth')?._id.toString()] ??
                    0) +
                    (values[tagname.get('pcs2StateOfHealth')?._id.toString()] ??
                        0)) /
                2,
            sumGridTotal: (values, tagname) =>
                (values[tagname.get('gridTotalPMSolar')?._id.toString()] ?? 0) +
                (values[tagname.get('gridTotal')?._id.toString()] ?? 0),
            sumImportPower: (values, tagname) =>
                (values[tagname.get('importPower')?._id.toString()] ?? 0) +
                (values[tagname.get('importPowerSolar')?._id.toString()] ?? 0),
            sumGridPowerPh1: (values, tagname) =>
                (values[tagname.get('gridPowerPh1PMSolar')?._id.toString()] ?? 0) +
                (values[tagname.get('gridPowerPh1')?._id.toString()] ?? 0),
            sumGridPowerPh2: (values, tagname) =>
                (values[tagname.get('gridPowerPh2PMSolar')?._id.toString()] ?? 0) +
                (values[tagname.get('gridPowerPh2')?._id.toString()] ?? 0),
            sumGridPowerPh3: (values, tagname) =>
                (values[tagname.get('gridPowerPh3PMSolar')?._id.toString()] ?? 0) +
                (values[tagname.get('gridPowerPh3')?._id.toString()] ?? 0),
            sumGridCurrentPh1: (values, tagname) =>
                (values[tagname.get('gridCurrentPh1PMSolar')?._id.toString()] ?? 0) +
                (values[tagname.get('gridCurrentPh1')?._id.toString()] ?? 0),
            sumGridCurrentPh2: (values, tagname) =>
                (values[tagname.get('gridCurrentPh2PMSolar')?._id.toString()] ?? 0) +
                (values[tagname.get('gridCurrentPh2')?._id.toString()] ?? 0),
            sumGridCurrentPh3: (values, tagname) =>
                (values[tagname.get('gridCurrentPh3PMSolar')?._id.toString()] ?? 0) +
                (values[tagname.get('gridCurrentPh3')?._id.toString()] ?? 0),
            sumGridAmp: (values, tagname) =>
                (values[tagname.get('gridAmpPMSolar')?._id.toString()] ?? 0) +
                (values[tagname.get('gridAmp')?._id.toString()] ?? 0),
            //TÍNH AVG
            avgGridVolt: (values, tagname) =>
                ((values[tagname.get('gridVoltPMSolar')?._id.toString()] ?? 0) +
                    (values[tagname.get('gridVolt')?._id.toString()] ?? 0)) / 2,
            avgGridFreq: (values, tagname) =>
                ((values[tagname.get('gridFreqPMSolar')?._id.toString()] ?? 0) +
                    (values[tagname.get('gridFreq')?._id.toString()] ?? 0)) / 2,
            avgGridPowerFactor: (values, tagname) =>
                ((values[tagname.get('gridPowerFactorPMSolar')?._id.toString()] ?? 0) +
                    (values[tagname.get('gridPowerFactor')?._id.toString()] ?? 0)) / 2,
            avgGridVoltagePh1: (values, tagname) =>
                ((values[tagname.get('gridVoltagePh1PMSolar')?._id.toString()] ?? 0) +
                    (values[tagname.get('gridVoltagePh1')?._id.toString()] ?? 0)) / 2,
            avgGridVoltagePh2: (values, tagname) =>
                ((values[tagname.get('gridVoltagePh2PMSolar')?._id.toString()] ?? 0) +
                    (values[tagname.get('gridVoltagePh2')?._id.toString()] ?? 0)) / 2,
            avgGridVoltagePh3: (values, tagname) =>
                ((values[tagname.get('gridVoltagePh3PMSolar')?._id.toString()] ?? 0) +
                    (values[tagname.get('gridVoltagePh3')?._id.toString()] ?? 0)) / 2,
        }

        const result = ids.map((key) => {
            if (tagnameValues[key._id] !== undefined) {
                return { [key.name]: tagnameValues[key._id] }
            } else if (computedMap[key.name]) {
                return {
                    [key.name]: computedMap[key.name](
                        tagnameValues,
                        foundNames,
                    ),
                }
            } else {
                return { [key.name]: null } // TH3: không có dữ liệu
            }
        })

        const valueMap = Object.assign({}, ...result)
        const values = tagnames.map((item) => valueMap[item.name] ?? 0)

        //CHECK XEM VALUES CÓ BỊ 0 HẾT KHÔNG -> NẾU TẤT CẢ = 0 -> KHÔNG WRITE FILE
        const isAllZero = values.every(item => item === 0);
        if (isAllZero) {
            logger.info('Tất cả values đều bằng 0. Bỏ qua ghi file.');
            return; // Thoát khỏi hàm callback của CronJob
        }

        const now = moment().tz('Asia/Ho_Chi_Minh')
        const dateStr = now.format('YYYY-MM-DD')

        const headers = tagnames.map((tag) => tag.header)
        const csvHeader = ['DateTime', ...headers].join(';')

        const dir = path.resolve(process.cwd(), 'storages/ftpFile')

        fs.mkdirSync(dir, { recursive: true }) //Chưa có thư mục thì tạo, có rồi thì bỏ qua

        const config = await ConfigFtpModel.findOne()
        const files = fileNameFtpConstant
        for (const file of files) {
            if (file === 'GY_RealTime') {
                const filePath = path.join(dir, `${file}.CSV`)

                await writeFtp(null, values, filePath)

                const fileStream = fs.createReadStream(filePath)
                const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity,
                })

                let lineCount = 0
                for await (const line of rl) {
                    lineCount++
                }

                rl.close()
                fileStream.close()
                if (lineCount >= 11) {
                    if (!config) {
                        logger.error('Không có thông tin SFTP')
                        return
                    }
                    const uploadPath = `/${config.folderName}/${file}.${config?.fileType || 'CSV'}`
                    await uploadFile(config, filePath, uploadPath)
                    try {
                        await fs.promises.unlink(filePath)
                        logger.info(`Đã xóa file: ${file}`)
                    } catch (err) {
                        logger.error(`Không thể xóa file ${file}:`, err.message)
                    }
                }
                return
            }
            const filePath = path.join(
                dir,
                `${dateStr}_${file}.${config?.fileType || 'CSV'}`,
            )

            await writeFtp(csvHeader, values, filePath)
        }
    } catch (error) {
        logger.error('writeFtpCron lỗi!')
        logger.error(error)
    }
})
writeFtpCron.start()
