
const express = require("express");
const router = express.Router();

const { createEvent, getAllEvents,getEventById,updateEvent,deleteEvent } = require("../controllers/eventController");
const { protect } = require("../middleware/auth");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/events", protect, upload.single("bannerImage"), createEvent);
router.get("/events", getAllEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", protect, upload.single("bannerImage"), updateEvent);
router.delete("/events/:id", protect, deleteEvent);

module.exports = router;

