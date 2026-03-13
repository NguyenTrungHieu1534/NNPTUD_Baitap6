const fs = require('fs')
const path = require('path')
var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let { RegisterValidator, handleResultValidator } = require('../utils/validatorHandler')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler')

// Đọc RSA private key để ký token (thuật toán RS256)
const privateKey = fs.readFileSync(path.join(__dirname, '..', 'private.pem'), 'utf8')

router.post('/register', RegisterValidator, handleResultValidator, async function (req, res, next) {
    try {
        let newUser = userController.CreateAnUser(
            req.body.username,
            req.body.password,
            req.body.email,
            "69aa8360450df994c1ce6c4c"
        );
        await newUser.save()
        res.send({ message: "Đăng ký thành công" })
    } catch (err) {
        res.status(400).send({ message: err.message })
    }
});

router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let getUser = await userController.FindByUsername(username);
    if (!getUser) {
        return res.status(403).send({ message: "Tài khoản không tồn tại" })
    }

    if (getUser.lockTime && getUser.lockTime > Date.now()) {
        return res.status(403).send({ message: "Tài khoản đang bị khóa, vui lòng thử lại sau" });
    }

    if (bcrypt.compareSync(password, getUser.password)) {
        await userController.SuccessLogin(getUser);

        // Ký token bằng RS256 (asymmetric) - dùng private key
        let token = jwt.sign(
            { id: getUser._id },
            privateKey,
            {
                algorithm: 'RS256',
                expiresIn: '30d'
            }
        )
        res.send({ token })
    } else {
        await userController.FailLogin(getUser);
        res.status(403).send({ message: "Thông tin đăng nhập không đúng" })
    }
});

router.get('/me', checkLogin, function (req, res, next) {
    res.send(req.user)
})

module.exports = router;
