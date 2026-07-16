const generateToken = require("../utils/generateToken");

const Event = require("../models/Event");

const createEvent = async (req,res,next)=>{
 try {
   const {title,description,category,venue,city,eventDate,bannerImage} = req.body;
  if(!title || !description || !category || !venue || !city || !eventDate || !bannerImage){
    res.status(400);
    return next(new Error("All fields are required"));
  }
  const event =await Event.create({
    title,
    description,
    category,
    venue,
    city,
    eventDate,
    bannerImage,
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
const updateEvent = async (req,res,next)=>{
  try{
    const event = await Event.findById(req.params.id);
    if(!event){
      res.status(404);
      return next(new Error("Event not found"));
    }
     if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      return next(new Error("Not authorized to update this event"));
    }

    const {title,description,category,venue,city,eventDate,bannerImage} = req.body;
    if(!title || !description || !category || !venue || !city || !eventDate || !bannerImage){
      res.status(400);
      return next(new Error("All fields are required"));
    }
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id,{
      title,
      description,
      category,
      venue,
      city,
      eventDate,
      bannerImage
    },{new:true});

    res.status(200).json({
      success:true,
      event:updatedEvent
    });


  }catch(error){
    next(error)
  }
}

const deleteEvent = async (req,res,next)=>{
  try{
    const event = await Event.findById(req.params.id);
    if(!event){
      res.status(404);
      return next(new Error("Event not found"));
    }
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      return next(new Error("Not authorized to delete this event"));
    }
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success:true,
      message:"Event deleted successfully"
    });
  }catch(error){
    next(error)
  }
}

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
