const express = require("express");
const router = express.Router();
const { getAllListings, getListingById, createListing, updateListing,deleteListing } = require("../controllers/listingController");
const { protect, authorize } = require("../middleware/auth");


router.post("/", protect,authorize("admin","seller"), createListing);
router.get("/", getAllListings);
router.get("/:id", getListingById);
router.put("/:id", protect, authorize("admin","seller"), updateListing);
router.delete("/:id", protect, authorize("admin","seller")  , deleteListing);


module.exports = router;

