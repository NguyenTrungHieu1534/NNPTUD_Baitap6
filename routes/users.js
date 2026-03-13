var express = require("express");
var router = express.Router();
let { checkLogin } = require('../utils/authHandler')
let {
    userCreateValidator,
    userUpdateValidator,
    handleResultValidator,
    changePasswordValidator
} = require('../utils/validatorHandler')

let userController = require("../controllers/users");
let userModel = require("../schemas/users");

router.get("/", async function (req, res, next) {
    let users = await userModel
        .find({ isDeleted: false }).populate({
            path: 'role',
            select: 'name'
        })
    res.send(users);
});

router.get("/me", checkLogin, async function (req, res, next) {
    let users = await userController.GetAllUser();
    res.send(users);
});

router.post("/", userCreateValidator, handleResultValidator,
    async function (req, res, next) {
        try {
            let newItem = userController.CreateAnUser(
                req.body.username,
                req.body.password, req.body.email, req.body.fullName,
                req.body.avatarUrl, req.body.role, req.body.status, req.body.loginCount
            )
            await newItem.save();

            let saved = await userModel.findById(newItem._id)
            res.send(saved);
        } catch (err) {
            res.status(400).send({ message: err.message });
        }
    });

router.put("/:id", userUpdateValidator, handleResultValidator, async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await userModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedItem)
            return res.status(404).send({ message: "id not found" });

        let populated = await userModel.findById(updatedItem._id)
        res.send(populated);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await userModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).send({ message: "id not found" });
        }
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// POST /api/v1/users/change-password
// Headers: Authorization: Bearer <token>
// Body: { oldPassword, newPassword, confirmNewPassword }
router.post("/change-password",
    checkLogin,
    changePasswordValidator,
    handleResultValidator,
    async function (req, res, next) {
        try {
            const { oldPassword, newPassword } = req.body;
            const result = await userController.changePassword(req.user, oldPassword, newPassword);

            if (!result) {
                return res.status(400).send({ message: "Mật khẩu cũ không chính xác" });
            }

            res.send({ message: "Đổi mật khẩu thành công!" });
        } catch (err) {
            res.status(400).send({ message: err.message });
        }
    });

module.exports = router;