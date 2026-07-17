
const express = require("express");
const router = express.Router();

const { createEvent, getAllEvents,getEventById,updateEvent,deleteEvent } = require("../controllers/eventController");
const { protect } = require("../middleware/auth");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", protect, upload.single("bannerImage"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", protect, upload.single("bannerImage"), updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;

