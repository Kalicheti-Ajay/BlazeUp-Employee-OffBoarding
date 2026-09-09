const express = require("express");

const {
    startWorkflowController,
    approveTaskController,
    rejectTaskController,
    revokeAccessController,
    getWorkflowDetailsController
} = require("../controllers/workflowController");

const { protect } =
    require("../middleware/authMiddleware");

const router = express.Router();


/*
    Start workflow
*/
router.post(
    "/start",
    protect,
    require("../middleware/roleMiddleware")("HR_ADMIN"),
    startWorkflowController
);


/*
    Get workflow
*/
router.get(
    "/:id",
    protect,
    getWorkflowDetailsController
);


/*
    Approve task
*/
router.post(
    "/tasks/:taskId/approve",
    protect,
    approveTaskController
);


/*
    Reject task
*/
router.post(
    "/tasks/:taskId/reject",
    protect,
    rejectTaskController
);

router.post("/tasks/:taskId/revoke-access", protect, revokeAccessController);


module.exports = router;
