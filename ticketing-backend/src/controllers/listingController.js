const generateToken = require('../utils/generateToken');
const Listing = require('../models/TicketingListing');
const Event = require('../models/Event');
const { uploadImage,deleteImage } = require("../services/cloudinaryService");

const createListing = async (req, res, next) => {
  try{
    const { event, section, seatInfo, price, faceValue, quantity } = req.body;
    const eventExists = await Event.findById(event);
    if(!eventExists){
      res.status(404);
      return next(new Error("Event not found"));
    }
     if(!req.file){
    res.status(400);
    return next(new Error("Banner image is required"));
  }
  const uploadedImage = await uploadImage(req.file.buffer);
    const listing = await Listing.create({
      event,
      seller: req.user._id,
      section,
      seatInfo,
      price,
      proofImage: {
    url: uploadedImage.secure_url,
    public_id: uploadedImage.public_id,
  },
      quantity,
      proofImage
    });

    const token = generateToken(req.user._id);
    res.status(201).json({
      success: true,
      listing: listing,
      token
    });
  }catch(error){
    next(error)
  }
}

const getAllListings = async (req, res, next) => {
  try{
    const filter = {};
    if(req.query.event){
      filter.event = req.query.event;
    }
    const listings = await Listing.find(filter).populate("event").populate("seller","name email");

    res.status(200).json({
      success: true,
      listings: listings
    });
  }catch(error){
    next(error)
  }
}
const getListingById = async (req, res, next) => {
  try{
    const listing = await Listing.findById(req.params.id).populate("event").populate("seller","name email");
    if(!listing){
      res.status(404);
      return next(new Error("Listing not found"));
    }
    res.status(200).json({
      success: true,
      listing
    });
  }catch(error){
    next(error)
  }
}
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
      return next(
        new Error("You are not authorized to update this listing")
      );
    }

    if (listing.status !== "listed") {
      res.status(400);
      return next(
        new Error("Cannot edit a listing that's already reserved or sold")
      );
    }

    const { section, seatInfo, price, faceValue, quantity } = req.body;

    if (!section || !seatInfo || !price || !faceValue || !quantity) {
      res.status(400);
      return next(new Error("All fields are required"));
    }

    let proofImage = listing.proofImage;

    if (req.file) {
      await deleteImage(listing.proofImage.public_id);

      const uploadedImage = await uploadImage(
        req.file.buffer,
        "ticket-proofs"
      );

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
      token: generateToken(req.user._id),
    });
  } catch (error) {
    next(error);
  }
};

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
      return next(
        new Error("You are not authorized to delete this listing")
      );
    }

    // Delete image from Cloudinary
    await deleteImage(listing.proofImage.public_id);

    // Delete listing from MongoDB
    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
      token: generateToken(req.user._id),
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

