

const listingId = process.argv[2];
const token1 = process.argv[3];
const token2 = process.argv[4];

if (!listingId || !token1 || !token2) {
  console.error("Usage: node testConcurrency.js <listingId> <buyerToken1> <buyerToken2>");
  process.exit(1);
}

async function attemptOrder(token, label) {
  const response = await fetch("http://localhost:5000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ticketListingId: listingId }),
  });

  const data = await response.json();
  console.log(`[${label}] status: ${response.status} | success: ${data.success} | message: ${data.message || "(order created)"}`);
  return { label, status: response.status, data };
}

async function main() {
  console.log("Firing two simultaneous order requests for the same listing...\n");

  const results = await Promise.all([
    attemptOrder(token1, "Buyer A"),
    attemptOrder(token2, "Buyer B"),
  ]);

  const successes = results.filter((r) => r.status === 201);

  console.log(`\nResult: ${successes.length} out of 2 requests succeeded.`);
  if (successes.length === 1) {
    console.log("✅ PASS — race condition is properly handled.");
  } else {
    console.log("❌ FAIL — expected exactly 1 success, this indicates the race condition still exists.");
  }
}

main().catch((err) => console.error("Script error:", err));