const QRCode = require("qrcode");
const crypto = require("crypto");

// Concept: crypto.randomBytes() generates cryptographically secure
// random bytes — NOT the same as Math.random(), which is predictable
// and unsuitable for anything security-related. We convert to hex so
// it's a safe, URL-friendly string. This is the actual secret that
// proves "this ticket transfer is genuine" — guessing it should be
// computationally infeasible.
function generateUniqueToken() {
  return crypto.randomBytes(24).toString("hex");
}

// Concept: this function takes a piece of text (our unique token) and
// encodes it visually as a QR code, returned as a base64 data URL —
// a string that a browser can render directly as an image, e.g.:
// <img src={qrCodeImage} />
async function generateQRCodeImage(data) {
  const dataUrl = await QRCode.toDataURL(data);
  return dataUrl;
}

module.exports = { generateUniqueToken, generateQRCodeImage };