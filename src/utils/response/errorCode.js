const errorCode = {
    INCORRECT_USERNAME: {
        code: 2,
        message: 'Incorrect username!',
    },
    INCORRECT_PASSWORD: {
        code: 3,
        message: 'Incorrect password!',
    },
    USER_NOT_FOUND: {
        code: 4,
        message: 'User not found!',
    },
    USER_EXISTED: {
        code: 5,
        message: 'Username already exists!',
    },
    IMAGE_NOT_FOUND: {
        code: 6,
        message: 'Logo image not found!',
    },
    ROLE_NOT_FOUND: {
        code: 7,
        message: 'Role not found!',
    },
    CONTROL_NOT_ARRAY: {
        code: 8,
        message: 'Controls not array!',
    },
    ENTER_STARTTIME_ENDTIME: {
        code: 9,
        message: 'Hãy nhập StartTime và EndTime!',
    },
    NO_DEVICE_FOUND: {
        code: 10,
        message: 'Không tìm thấy thiết bị!',
    },
}

module.exports = errorCode
