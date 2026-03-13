const fs = require('fs')
const path = require('path')
let jwt = require('jsonwebtoken')
let userController = require('../controllers/users')

// Đọc RSA public key để verify token (thuật toán RS256)
const publicKey = fs.readFileSync(path.join(__dirname, '..', 'public.pem'), 'utf8')

module.exports = {
    checkLogin: async function (req, res, next) {
        let token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(403).send({ message: "Bạn chưa đăng nhập" });
        }
        token = token.split(" ")[1];
        try {
            // Verify bằng RS256 public key
            let result = jwt.verify(token, publicKey, { algorithms: ['RS256'] })
            let user = await userController.FindById(result.id)
            if (!user) {
                return res.status(403).send({ message: "Người dùng không tồn tại" });
            }
            req.user = user;
            next()
        } catch (error) {
            res.status(403).send({ message: "Token không hợp lệ hoặc đã hết hạn" });
        }
    }
}