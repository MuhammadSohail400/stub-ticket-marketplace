
// Finite state machine defining valid order lifecycle transitions.
// This utility centralizes allowed status changes and protects
// business rules from inconsistent state mutations.
const VALID_TRANSITIONS = {
  pending: ["paid", "cancelled"],
  paid: ["transferred", "refunded"],
  transferred: ["completed", "disputed"],
  disputed: ["completed", "refunded"],
  completed: [],
  cancelled: [],
  refunded: [],
};

function isValidTransition(currentStatus, nextStatus) {
  const allowedNextStates = VALID_TRANSITIONS[currentStatus] || [];
  return allowedNextStates.includes(nextStatus);
}

module.exports = { VALID_TRANSITIONS, isValidTransition };
