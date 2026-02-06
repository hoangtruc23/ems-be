const dataType = [
    { id: 1, name: 'Signed' }, // 2 byte
    { id: 2, name: 'Unsigned' }, // 2 byte
    { id: 3, name: 'Float Big Endian (ABCD)' }, // 4 byte
    { id: 4, name: 'Float Little Endian (DCBA)' }, // 4 byte
    { id: 5, name: 'Float Mid-Big Endian (BADC)' },
    { id: 6, name: 'Float Mid-Little Endian (CDAB)' },
    { id: 7, name: 'Unsigned 32 Big Endian (ABCD)' }, // UINT Big Endian (ABCD)
    { id: 8, name: 'Unsigned Little Endian (DCBA)' }, // 4 byte
    { id: 9, name: 'Unsigned Mid-Big Endian (BADC)' },
    { id: 10, name: 'Unsigned Mid-Little Endian (CDAB)' },
    { id: 11, name: 'Signed Big Endian (ABCD)' }, //INT32 Big Endian (ABCD)
]

const functionCodeModbus = [
    { id: 1, name: '01 Read Coils (0x)' },
    { id: 2, name: '02 Read Discrete Input (1x)' },
    { id: 3, name: '03 Read Holding Registers (4x)' },
    { id: 4, name: '04 Read Input Registers (3x)' },
]

const getDataByteOfAddress = (type) => {
    let addressByte = 2
    switch (type) {
        // Signed, Unsigned
        case 1:
        case 2: {
            addressByte = 1
            break
        }
        // Float Big Endian (ABCD), Float Little Endian (DCBA), Float Mid-Big Endian (BADC), Float Mid-Little Endian (CDAB)
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11: {
            addressByte = 2
            break
        }
    }
    return addressByte
}

const getDataByDataType = (dataBuffer, type) => {
    let data = null
    switch (type) {
        //'Signed'
        case 1: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([A, B])
            data = new DataView(reordered.buffer).getInt16(0)
            break
        }
        // Unsigned
        case 2: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([A, B])
            data = new DataView(reordered.buffer).getUint16(0)
            break
        }
        // Float Big Endian (ABCD)
        case 3: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([A, B, C, D])

            data = new DataView(reordered.buffer).getFloat32(0)
            break
        }
        // Float Little Endian (DCBA)
        case 4: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([D, C, B, A])
            data = new DataView(reordered.buffer).getFloat32(0)
            break
        }
        // Float Mid-Big Endian (BADC)
        case 5: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([B, A, D, C])
            data = new DataView(reordered.buffer).getFloat32(0)
            break
        }
        // Float Mid-Little Endian (CDAB)
        case 6: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([C, D, A, B])
            data = new DataView(reordered.buffer).getFloat32(0)
            break
        }
        // UINT Big Endian (ABCD)
        case 7: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([A, B, C, D])

            data = new DataView(reordered.buffer).getUint32(0)
            break
        }
        // UINT Little Endian (DCBA)
        case 8: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([D, C, B, A])
            data = new DataView(reordered.buffer).getUint32(0)
            break
        }
        // Uint Mid-Big Endian (BADC)
        case 9: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([B, A, D, C])
            data = new DataView(reordered.buffer).getUint32(0)
            break
        }
        // Uint Mid-Little Endian (CDAB)
        case 10: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([C, D, A, B])
            data = new DataView(reordered.buffer).getUint32(0)
            break
        }
        // INT Big Endian (ABCD)
        case 11: {
            const hexToUint8 = (str) =>
                Uint8Array.from(
                    str.match(/.{1,2}/g).map((comp) => parseInt(comp, 16)),
                )
            const dataBufferString = dataBuffer.toString('hex')
            const [A, B, C, D] = hexToUint8(dataBufferString)
            const reordered = new Uint8Array([A, B, C, D])

            data = new DataView(reordered.buffer).getInt32(0)
            break
        }
    }
    return data
}

module.exports = {
    dataType,
    functionCodeModbus,
    getDataByteOfAddress,
    getDataByDataType,
}
