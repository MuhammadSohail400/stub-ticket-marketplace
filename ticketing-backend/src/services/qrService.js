const QRCode = require("qrcode");
const crypto = require("crypto");

// Concept: crypto.randomBytes() generates cryptographically secure
// random bytes — NOT the same as Math.random(), which is predictable
// and unsuitable for anything security-related. We convert to hex so
// it's a safe, URL-friendly string. This is the actual secret that
// proves "this ticket transfer is genuine" — guessing it should be
// computationally infeasible (24 bytes = 48 hex chars = 2^192 space).
function generateUniqueToken() {
  return crypto.randomBytes(24).toString("hex");
}

// Concept: this function takes a piece of text (our unique token) and
// encodes it visually as a QR code, returned as a raw Buffer (PNG bytes).
// The buffer is piped into Cloudinary's upload_stream via cloudinaryService
// — it is NOT a base64 data URL and cannot be used as an <img src> directly.
// To display the QR code, use the Cloudinary URL stored in TicketTransfer.
async function generateQRCodeImage(data) {
  const buffer = await QRCode.toBuffer(data);
  return buffer;
}

module.exports = { generateUniqueToken, generateQRCodeImage };