const express = require("express");
const router = express.Router();
const { getAllListings, getListingById, createListing, updateListing,deleteListing } = require("../controllers/listingController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");


router.post("/", protect,authorize("admin","seller"), upload.single("proofImage"),createListing);
router.get("/", getAllListings);
router.get("/:id", getListingById);
router.put("/:id", protect, authorize("admin","seller"), upload.single("proofImage"),updateListing);
router.delete("/:id", protect, authorize("admin","seller")  , deleteListing);


module.exports = router;

