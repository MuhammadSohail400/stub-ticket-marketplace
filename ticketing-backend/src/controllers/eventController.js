const generateToken = require("../utils/generateToken");

const Event = require("../models/Event");
const cloudinary = require("../config/cloudinary");
const { uploadImage,deleteImage } = require("../services/cloudinaryService");

const createEvent = async (req,res,next)=>{
 try {
   const {title,description,category,venue,city,eventDate} = req.body;
  if(!title || !description || !category || !venue || !city || !eventDate ){
    res.status(400);
    return next(new Error("All fields are required"));
  }
  if(!req.file){
    res.status(400);
    return next(new Error("Banner image is required"));
  }
  const uploadedImage = await uploadImage(req.file.buffer);

  const event =await Event.create({
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
    createdBy:req.user._id
  });
  const token = generateToken(req.user._id);
  res.status(201).json({
    success:true,
    event,
    token
  });


 }catch (error) {
    next(error)
 }


}


const getAllEvents = async (req,res,next)=>{
  try{

    const events = await Event.find().populate("createdBy","name email");
    const city = req.query.city;
    const category = req.query.category;
    let filteredEvents = events;
    if(city){
      filteredEvents = filteredEvents.filter(event => event.city.toLowerCase() === city.toLowerCase());
    }
    if(category){
      filteredEvents = filteredEvents.filter(event => event.category.toLowerCase() === category.toLowerCase());
    }

    res.status(200).json({
      success:true,
      events: filteredEvents
    });
  }catch(error){
    next(error)
  }
}

const getEventById = async (req,res,next)=>{
  try{
    const event = await Event.findById(req.params.id).populate("createdBy","name email");
    if(!event){
      res.status(404);
      return next(new Error("Event not found"));
    }
    res.status(200).json({
      success:true,
      event
    });

  }catch(error){
    next(error)
  }
}
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
      return next(new Error("Not authorized"));
    }

    const {
      title,
      description,
      category,
      venue,
      city,
      eventDate,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !venue ||
      !city ||
      !eventDate
    ) {
      res.status(400);
      return next(new Error("All fields are required"));
    }

    let bannerImage = event.bannerImage;

    if (req.file) {
      await deleteImage(event.bannerImage.public_id);

      const uploadedImage = await uploadImage(
        req.file.buffer,
        "events"
      );

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
      return next(new Error("Not authorized"));
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
