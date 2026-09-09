const express = require("express");

const {
    createOffboarding,
    getOffboardings,
    getOffboarding,
    sendReminder
} = require("../controllers/offboardingController");

const {
    protect
} = require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const router = express.Router();


router.post(
    "/",
    protect,
    authorizeRoles("HR_ADMIN"),
    createOffboarding
);


router.get(
    "/",
    protect,
    authorizeRoles(
        "HR_ADMIN",
        "REPORTING_MANAGER",
        "ADMIN",
        "ACCOUNTS",
        "PERSONNEL"
    ),
    getOffboardings
);

router.post("/:id/reminder", protect, authorizeRoles("HR_ADMIN"), sendReminder);


router.get(
    "/:id",
    protect,
    authorizeRoles(
        "HR_ADMIN",
        "REPORTING_MANAGER",
        "ADMIN",
        "ACCOUNTS",
        "PERSONNEL"
    ),
    getOffboarding
);


module.exports = router;
