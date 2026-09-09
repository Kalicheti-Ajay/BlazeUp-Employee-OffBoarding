const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { downloadDocument } = require("../controllers/documentController");
router.get("/:id/documents/:kind", protect, downloadDocument);
module.exports = router;
