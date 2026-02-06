const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')

router.get('/getAll', userController.getAll)
router.get('/getUser/:userId', userController.getById)
router.post('/create', userController.create)
router.put('/update/:userId', userController.update)
router.put('/changePassword/:userId', userController.changePassword)
router.delete('/delete/{userId}', userController.delete)

module.exports = router

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /user/getAll:
 *   get:
 *     summary: Lấy tất cả người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: OK!
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 684686f736b60123f03418dd
 *                           username:
 *                             type: string
 *                             example: admin
 *                           role:
 *                             type: string
 *                             example: admin
 */

/**
 * @swagger
 * /user/getUser/{userId}:
 *   get:
 *     summary: Lấy chi tiết người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Chi tiết người dùng
 *         content:
 *           application/json:
 *             schema:
 */

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Tạo người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 684686f736b60123f03418dd
 *                     username:
 *                       type: string
 *                       example: admin
 *                     role:
 *                       type: string
 *                       example: admin
 */

/**
 * @swagger
 * /user/update/{userId}:
 *   put:
 *     summary: Cập nhật người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: new_admin
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 684686f736b60123f03418dd
 *                     username:
 *                       type: string
 *                       example: new_admin
 *                     role:
 *                       type: string
 *                       example: user
 */

/**
 * @swagger
 * /user/changePassword/{userId}:
 *   put:
 *     summary: Đổi mật khẩu người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordNew
 *             properties:
 *               passwordNew:
 *                 type: string
 *                 example: newPass456
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: OK!
 */

/**
 * @swagger
 * /user/delete/{userId}:
 *   delete:
 *     summary: Xoá người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xoá thành công
 */
