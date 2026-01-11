import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ========== Environment Variables ==========
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ========== Validate Environment Variables ==========
if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error(
    "❌ Missing blockchain environment variables (RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS)"
  );
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY)"
  );
  process.exit(1);
}

// ========== Smart Contract Setup ==========
// ComplaintRegistryV2 ABI (owner-only writes, status stored on-chain)
const ABI = [
  // Writes
  "function logComplaint(uint256 _complaintId, string _city, string _category) external",
  "function updateComplaintStatus(uint256 _complaintId, uint8 _status) external",
  // Reads
  "function getComplaint(uint256 _complaintId) external view returns (tuple(uint256 complaintId, string city, string category, address recordedBy, uint256 timestamp, uint8 status))",
  // Events
  "event ComplaintLogged(uint256 indexed complaintId, string city, string category, address recordedBy, uint256 timestamp, uint8 status)",
  "event ComplaintStatusUpdated(uint256 indexed complaintId, uint8 status)",
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

console.log("🔗 Connected to blockchain");
console.log("📍 Contract Address:", CONTRACT_ADDRESS);
console.log("👛 Wallet Address:", wallet.address);

// ========== Supabase Setup ==========
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log("🗄 Connected to Supabase");

// ========== Track Processing Complaints/Status Updates ==========
const processingComplaints = new Set();
const processingStatusUpdates = new Set();

// Realtime channel and polling handles for reconnects/cleanup
let realtimeChannel = null;
let pollingIntervalId = null;
let heartbeatIntervalId = null;
// Map app status -> on-chain enum (Pending=0, Resolved=1, Verified=2)
function mapStatusToEnum(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'pending') return 0;
  if (s === 'resolved') return 1;
  if (s === 'verified') return 2;
  return 0; // default to Pending
}

// ========== Function to Mint Complaint to Blockchain ==========
async function mintComplaintToBlockchain(complaint) {
  const complaintId = complaint.id;

  // Prevent duplicate processing
  if (processingComplaints.has(complaintId)) {
    console.log(
      `⏳ Complaint ${complaintId} is already being processed, skipping...`
    );
    return;
  }

  // Check if already minted
  if (complaint.tx_hash) {
    console.log(
      `✅ Complaint ${complaintId} already has tx_hash: ${complaint.tx_hash}, skipping...`
    );
    return;
  }

  processingComplaints.add(complaintId);

  try {
    console.log(`\n📜 Processing complaint ${complaintId}...`);
    console.log(`   Title: ${complaint.title}`);
    console.log(`   Category: ${complaint.category_id}`);
    console.log(`   Municipal: ${complaint.municipal_id}`);

    // IMPORTANT: Use municipal_id as city (locationAB is the address string)
    const city = complaint.municipal_id || complaint.locationAB || "Unknown";
    const category = complaint.category_id || "General";

    console.log(
      `⛓ Calling smart contract logComplaint(${complaintId}, "${city}", "${category}")...`
    );

    // Call smart contract
    const tx = await contract.logComplaint(complaintId, city, category);

    console.log(`📤 Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log(`✅ Transaction confirmed!`);
    console.log(`   Block Number: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Transaction Hash: ${receipt.hash}`);

    // Update database with transaction hash
    const { error: updateError } = await supabase
      .from("complaints")
      .update({ tx_hash: receipt.hash })
      .eq("id", complaintId);

    if (updateError) {
      console.error(
        `❌ Failed to update tx_hash in database for complaint ${complaintId}:`,
        updateError
      );
    } else {
      console.log(
        `💾 Database updated with tx_hash for complaint ${complaintId}`
      );
    }
  } catch (error) {
    console.error(
      `❌ Error minting complaint ${complaintId} to blockchain:`,
      error
    );

    // Store error in database (optional)
    try {
      await supabase
        .from("complaints")
        .update({
          tx_hash: `ERROR: ${error.message.substring(0, 200)}`,
        })
        .eq("id", complaintId);
    } catch (dbError) {
      console.error(`❌ Failed to store error in database:`, dbError);
    }
  } finally {
    processingComplaints.delete(complaintId);
  }
}

// ========== Function to Update On-Chain Status ==========
async function updateComplaintStatusOnChain(complaint) {
  const complaintId = complaint.id;
  const statusEnum = mapStatusToEnum(complaint.status);

  const key = `${complaintId}:${statusEnum}`;
  if (processingStatusUpdates.has(key)) {
    console.log(`⏳ Status update for complaint ${complaintId} already in-flight, skipping...`);
    return;
  }
  processingStatusUpdates.add(key);

  try {
    console.log(`\n🔄 Updating on-chain status for complaint ${complaintId} -> ${complaint.status} (${statusEnum})`);
    const tx = await contract.updateComplaintStatus(complaintId, statusEnum);
    console.log(`📤 Status tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Status update confirmed in block ${receipt.blockNumber}`);
  } catch (error) {
    console.error(`❌ Failed to update on-chain status for ${complaintId}:`, error);
  } finally {
    processingStatusUpdates.delete(key);
  }
}

// ========== Process Existing Complaints Without tx_hash ==========
async function processExistingComplaints() {
  try {
    console.log("\n🔍 Checking for existing complaints without tx_hash...");

    const { data: complaints, error } = await supabase
      .from("complaints")
      .select("id, title, category_id, locationAB, municipal_id, tx_hash")
      .is("tx_hash", null)
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Error fetching existing complaints:", error);
      return;
    }

    if (!complaints || complaints.length === 0) {
      console.log("✨ No pending complaints to process");
      return;
    }

    console.log(
      `📋 Found ${complaints.length} complaint(s) to mint to blockchain`
    );

    // Process each complaint sequentially to avoid nonce issues
    for (const complaint of complaints) {
      await mintComplaintToBlockchain(complaint);
      // Add small delay between transactions to avoid nonce conflicts
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("\n✅ Finished processing existing complaints");
  } catch (error) {
    console.error("❌ Error in processExistingComplaints:", error);
  }
}

// ========== Setup Realtime Listener ==========
function setupRealtimeListener() {
  console.log("\n👂 Setting up realtime listener for new complaints...");

  // Use a reconnecting subscribe function with exponential backoff
  let retryDelay = 5000; // start with 5s

  const subscribe = () => {
    // Clean up previous channel if exists
    if (realtimeChannel) {
      try {
        supabase.removeChannel(realtimeChannel);
      } catch (e) {
        // ignore
      }
      realtimeChannel = null;
    }

    realtimeChannel = supabase
      .channel("complaints-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "complaints",
        },
        async (payload) => {
          console.log("\n🆕 New complaint detected!");
          console.log("Payload:", JSON.stringify(payload.new, null, 2));

          const newComplaint = payload.new;

          // Add small delay to ensure database transaction is complete
          await new Promise((resolve) => setTimeout(resolve, 1000));

          await mintComplaintToBlockchain(newComplaint);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "complaints",
        },
        async (payload) => {
          try {
            const prev = payload.old || {};
            const curr = payload.new || {};
            if (!curr || curr.id == null) return;
            if (prev.status !== curr.status && curr.status) {
              console.log(`\n✏️ Complaint ${curr.id} status changed: ${prev.status} -> ${curr.status}`);
              await updateComplaintStatusOnChain(curr);
            }
          } catch (e) {
            console.error('❌ Error handling status UPDATE event:', e);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to realtime updates");
          // reset retry delay on success
          retryDelay = 5000;
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Channel error subscribing to realtime updates");
          console.log(`🔁 Reconnecting in ${retryDelay / 1000}s...`);
          setTimeout(() => {
            retryDelay = Math.min(60000, retryDelay * 2);
            subscribe();
          }, retryDelay);
        } else if (status === "TIMED_OUT") {
          console.error("⏱ Subscription timed out");
          console.log(`🔁 Re-subscribing in ${retryDelay / 1000}s...`);
          setTimeout(() => {
            retryDelay = Math.min(60000, retryDelay * 2);
            subscribe();
          }, retryDelay);
        } else {
          console.log(`📡 Subscription status: ${status}`);
        }
      });

    return realtimeChannel;
  };

  // Start subscription
  subscribe();

  // As a robust fallback, poll the DB periodically for missed complaints
  if (!pollingIntervalId) {
    pollingIntervalId = setInterval(() => {
      processExistingComplaints().catch((e) => console.error('❌ Polling error:', e));
    }, 60 * 1000); // every 60s
    console.log('⏱ Started periodic polling every 60s to catch missed complaints');
  }

  return realtimeChannel;
}

// ========== Heartbeat (keepalive) ==========
function startHeartbeat() {
  if (heartbeatIntervalId) return;
  heartbeatIntervalId = setInterval(async () => {
    try {
      // lightweight check to keep network paths active
      await supabase.from('complaints').select('id').limit(1);
      console.log('💓 Supabase heartbeat OK');
    } catch (err) {
      console.error('💔 Supabase heartbeat failed:', err?.message || err);
      // If heartbeat fails, attempt to re-establish realtime listener
      try {
        if (!realtimeChannel) {
          console.log('🔁 Heartbeat detected missing realtime channel, re-subscribing...');
          setupRealtimeListener();
        }
      } catch (e) {
        // ignore
      }
    }
  }, 30 * 1000); // every 30s
}

function stopHeartbeat() {
  if (heartbeatIntervalId) {
    clearInterval(heartbeatIntervalId);
    heartbeatIntervalId = null;
  }
}

// ========== Manual API Endpoint (Optional) ==========
app.post("/logComplaint", async (req, res) => {
  try {
    const { complaintId, city, category } = req.body;

    if (!complaintId || !city || !category) {
      return res.status(400).json({
        error: "Missing required fields: complaintId, city, category",
      });
    }

    console.log(
      `\n📜 Manual request to log complaint ${complaintId} (${category}) from ${city}`
    );

    // Call smart contract function
    const tx = await contract.logComplaint(complaintId, city, category);
    console.log("⛓ Transaction sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);

    res.json({
      success: true,
      txHash: receipt.hash,
      complaintId,
      city,
      category,
    });
  } catch (err) {
    console.error("❌ Blockchain error:", err);
    res.status(500).json({
      error: err.message,
      success: false,
    });
  }
});

// ========== Health Check Endpoint ==========
app.get("/health", (req, res) => {
  res.json({
    status: "running",
    contract: CONTRACT_ADDRESS,
    wallet: wallet.address,
    timestamp: new Date().toISOString(),
  });
});

// ========== Get Complaint from Blockchain ==========
app.get("/getComplaint/:id", async (req, res) => {
  try {
    const complaintId = req.params.id;
    console.log(`\n🔍 Fetching complaint ${complaintId} from blockchain...`);

    const complaint = await contract.getComplaint(complaintId);

    const statusEnum = Number(complaint.status);
    const statusText = statusEnum === 0 ? 'pending' : statusEnum === 1 ? 'resolved' : statusEnum === 2 ? 'verified' : 'unknown';

    res.json({
      success: true,
      complaint: {
        complaintId: complaint.complaintId.toString(),
        city: complaint.city,
        category: complaint.category,
        recordedBy: complaint.recordedBy,
        timestamp: new Date(Number(complaint.timestamp) * 1000).toISOString(),
        status: statusText,
        statusEnum,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching complaint:", err);
    res.status(500).json({
      error: err.message,
      success: false,
    });
  }
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // First, process any existing complaints without tx_hash
    await processExistingComplaints();

    // Then setup realtime listener for new complaints
    setupRealtimeListener();

    // Start heartbeat to keep websocket/network alive and detect failures
    startHeartbeat();

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚀 Backend server running at http://localhost:${PORT}`);
      console.log(`\n📊 Available endpoints:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /logComplaint - Manual complaint logging`);
      console.log(
        `   GET  /getComplaint/:id - Fetch complaint from blockchain`
      );
      console.log(
        `\n✨ Auto-minting is active. New complaints will be automatically minted to blockchain.`
      );
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

// ========== Graceful Shutdown ==========
process.on("SIGINT", async () => {
  console.log("\n\n👋 Shutting down gracefully...");
  try {
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    if (realtimeChannel) await supabase.removeChannel(realtimeChannel);
    if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
    stopHeartbeat();
    await supabase.removeAllChannels();
  } catch (e) {
    // ignore errors during shutdown
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n👋 Shutting down gracefully...");
  try {
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    if (realtimeChannel) await supabase.removeChannel(realtimeChannel);
    if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
    stopHeartbeat();
    await supabase.removeAllChannels();
  } catch (e) {
    // ignore errors during shutdown
  }
  process.exit(0);
});

// ========== Start the Application ==========
startServer();
