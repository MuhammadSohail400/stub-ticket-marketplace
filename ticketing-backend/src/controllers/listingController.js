const Listing = require("../models/TicketingListing");
const Event = require("../models/Event");
const { uploadImage, deleteImage } = require("../services/cloudinaryService");
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("../config/constants");

// POST /api/listings
// Creates a new ticket listing. Restricted to admin and seller roles via route middleware.
const createListing = async (req, res, next) => {
  try {
    const { event, section, seatInfo, price, faceValue, quantity } = req.body;

    if (!event || !section || !seatInfo || !price || !faceValue || !quantity) {
      res.status(400);
      return next(new Error("All fields are required"));
    }

    const eventExists = await Event.findById(event);
    if (!eventExists) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    if (!req.file) {
      res.status(400);
      return next(new Error("Proof image is required"));
    }

    const uploadedImage = await uploadImage(req.file.buffer, "ticket-proofs");

    const listing = await Listing.create({
      event,
      seller: req.user._id,
      section,
      seatInfo,
      price,
      faceValue,
      proofImage: {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      },
      quantity,
    });

    res.status(201).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/listings
// Returns a paginated list of listings, optionally filtered by event ID.
// Query params: event, page, limit
const getAllListings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE)
    );
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.event) {
      filter.event = req.query.event;
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("event")
        .populate("seller", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      listings,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/listings/:id
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("event")
      .populate("seller", "name email");

    if (!listing) {
      res.status(404);
      return next(new Error("Listing not found"));
    }

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/listings/:id
// Updates a listing. Only the seller who owns it or an admin may do this.
// Cannot edit a listing that is already reserved or sold.
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404);
      return next(new Error("Listing not found"));
    }

    if (
      listing.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      return next(new Error("You are not authorized to update this listing"));
    }

    if (listing.status !== "listed") {
      res.status(400);
      return next(new Error("Cannot edit a listing that's already reserved or sold"));
    }

    const { section, seatInfo, price, faceValue, quantity } = req.body;

    if (!section || !seatInfo || !price || !faceValue || !quantity) {
      res.status(400);
      return next(new Error("All fields are required"));
    }

    let proofImage = listing.proofImage;

    if (req.file) {
      await deleteImage(listing.proofImage.public_id);

      const uploadedImage = await uploadImage(req.file.buffer, "ticket-proofs");

      proofImage = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    listing.section = section;
    listing.seatInfo = seatInfo;
    listing.price = price;
    listing.faceValue = faceValue;
    listing.quantity = quantity;
    listing.proofImage = proofImage;

    await listing.save();

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/listings/:id
// Deletes a listing and its Cloudinary proof image.
// Only the owning seller or an admin may do this.
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404);
      return next(new Error("Listing not found"));
    }

    if (
      listing.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      return next(new Error("You are not authorized to delete this listing"));
    }

    await deleteImage(listing.proofImage.public_id);
    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
};
