/**
 * Application-wide constants.
 *
 * Centralising these values means a single edit propagates everywhere —
 * no more hunting for magic numbers scattered across controller files.
 */

// Platform fee charged on each ticket sale (5%).
// Adjust here if/when additional fee tiers are introduced.
const PLATFORM_FEE_RATE = 0.05;

// Default and maximum page sizes for paginated list endpoints.
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

module.exports = { PLATFORM_FEE_RATE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };
