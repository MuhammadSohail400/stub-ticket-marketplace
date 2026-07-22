
const express = require("express");
const router = express.Router();

const { createEvent, getAllEvents,getEventById,updateEvent,deleteEvent } = require("../controllers/eventController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");



router.post("/", protect, upload.single("bannerImage"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", protect, upload.single("bannerImage"), updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;

