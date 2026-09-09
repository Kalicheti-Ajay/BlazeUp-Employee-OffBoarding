const express = require("express");

const {
    createWorkflowTemplate,
    getWorkflowTemplates,
    updateWorkflowTemplate
} = require("../controllers/workflowTemplateController");

const { protect } =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const router = express.Router();


// Create workflow template
router.post(
    "/",
    protect,
    authorizeRoles("HR_ADMIN"),
    createWorkflowTemplate
);


// Get workflow templates
router.get(
    "/",
    protect,
    getWorkflowTemplates
);

router.put("/:id", protect, authorizeRoles("HR_ADMIN"), updateWorkflowTemplate);


module.exports = router;
