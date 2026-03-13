let { body, validationResult } = require('express-validator')

let options = {
    password: {
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1
    }
}

const passwordMsg = (opts) =>
    `Password phải dài ít nhất ${opts.minLength} ký tự, gồm ít nhất ${opts.minNumbers} số, ${opts.minUppercase} chữ hoa, ${opts.minLowercase} chữ thường, ${opts.minSymbols} ký tự đặc biệt`

module.exports = {
    userCreateValidator: [
        body('email').notEmpty().withMessage("Email không được rỗng").isEmail().withMessage('Email sai định dạng'),
        body('username').isAlphanumeric().withMessage("Username không được chứa ký tự đặc biệt"),
        body('password').isStrongPassword(options.password).withMessage(passwordMsg(options.password)),
    ],
    userUpdateValidator: [
        body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email sai định dạng').normalizeEmail(),
        body('username').optional().isAlphanumeric().withMessage("Username không được chứa ký tự đặc biệt"),
        body('password').optional({ checkFalsy: true }).isStrongPassword(options.password).withMessage(passwordMsg(options.password)),
    ],
    RegisterValidator: [
        body('email').notEmpty().withMessage("Email không được rỗng").bail().isEmail().withMessage('Email sai định dạng').normalizeEmail(),
        body('username').notEmpty().withMessage("Username không được rỗng").isAlphanumeric().withMessage("Username không được chứa ký tự đặc biệt"),
        body('password').notEmpty().withMessage("Password không được rỗng").isStrongPassword(options.password).withMessage(passwordMsg(options.password)),
    ],
    handleResultValidator: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(400).send(result.errors.map(e => e.msg))
            return;
        }
        next();
    },
    changePasswordValidator: [
        body('oldPassword')
            .notEmpty().withMessage("Mật khẩu cũ không được rỗng")
            .isStrongPassword(options.password).withMessage(passwordMsg(options.password)),
        body('newPassword')
            .notEmpty().withMessage("Mật khẩu mới không được rỗng")
            .isStrongPassword(options.password).withMessage(passwordMsg(options.password))
            .custom((value, { req }) => {
                if (value === req.body.oldPassword) {
                    throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
                }
                return true;
            }),
        body('confirmNewPassword')
            .notEmpty().withMessage("Xác nhận mật khẩu mới không được rỗng")
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error("Xác nhận mật khẩu mới không khớp");
                }
                return true;
            }),
    ]
}