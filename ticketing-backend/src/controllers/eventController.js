const Event = require("../models/Event");
const { uploadImage, deleteImage } = require("../services/cloudinaryService");
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("../config/constants");

// POST /api/events
// Creates a new event. Restricted to admin and seller roles via route middleware.
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, venue, city, eventDate } = req.body;

    if (!title || !description || !category || !venue || !city || !eventDate) {
      res.status(400);
      return next(new Error("All fields are required"));
    }

    if (!req.file) {
      res.status(400);
      return next(new Error("Banner image is required"));
    }

    const uploadedImage = await uploadImage(req.file.buffer, "events");

    const event = await Event.create({
      title,
      description,
      category,
      venue,
      city,
      eventDate,
      bannerImage: {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      },
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events
// Returns a paginated list of events, filtered at the DB level by city
// and/or category when those query params are provided.
// Query params: city, category, page, limit
const getAllEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE)
    );
    const skip = (page - 1) * limit;

    // Build filter at the DB layer — avoids pulling the entire collection
    // into memory for in-process Array.filter() calls.
    const filter = {};
    if (req.query.city) {
      // Case-insensitive match using a regex anchored to the full value.
      filter.city = { $regex: `^${req.query.city}$`, $options: "i" };
    }
    if (req.query.category) {
      filter.category = { $regex: `^${req.query.category}$`, $options: "i" };
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      events,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email");

    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id
// Updates an event. Only the original creator or an admin may do this.
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      return next(new Error("Not authorized to update this event"));
    }

    const { title, description, category, venue, city, eventDate } = req.body;

    if (!title || !description || !category || !venue || !city || !eventDate) {
      res.status(400);
      return next(new Error("All fields are required"));
    }

    let bannerImage = event.bannerImage;

    if (req.file) {
      await deleteImage(event.bannerImage.public_id);

      const uploadedImage = await uploadImage(req.file.buffer, "events");

      bannerImage = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    event.title = title;
    event.description = description;
    event.category = category;
    event.venue = venue;
    event.city = city;
    event.eventDate = eventDate;
    event.bannerImage = bannerImage;

    await event.save();

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id
// Deletes an event and its Cloudinary banner image.
// Only the original creator or an admin may do this.
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      return next(new Error("Not authorized to delete this event"));
    }

    await deleteImage(event.bannerImage.public_id);
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
