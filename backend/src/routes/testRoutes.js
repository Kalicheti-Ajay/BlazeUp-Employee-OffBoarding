const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/profile",
    protect,
    (req, res) => {
        res.json({
            success: true,
            message: "You are authenticated",
            user: req.user
        });
    }
);

router.get(
    "/hr-only",
    protect,
    authorizeRoles("HR_ADMIN"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome HR Admin"
        });
    }
);

module.exports = router;