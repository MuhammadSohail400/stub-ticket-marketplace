const express = require("express");
const router = express.Router();

const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// PUBLIC — anyone can browse events
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// PROTECTED — only admins and sellers may create or modify events
router.post("/", protect, authorize("admin", "seller"), upload.single("bannerImage"), createEvent);
router.put("/:id", protect, authorize("admin", "seller"), upload.single("bannerImage"), updateEvent);
router.delete("/:id", protect, authorize("admin", "seller"), deleteEvent);

module.exports = router;
