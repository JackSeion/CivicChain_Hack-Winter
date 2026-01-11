import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Try V1 ABI first
const ABI_V1 = [
  "function getComplaint(uint256 _complaintId) external view returns (tuple(uint256 complaintId, string city, string category, address recordedBy, uint256 timestamp))",
];

// Then V2 ABI
const ABI_V2 = [
  "function getComplaint(uint256 _complaintId) external view returns (tuple(uint256 complaintId, string city, string category, address recordedBy, uint256 timestamp, uint8 status))",
];

async function checkComplaint() {
  console.log("🔍 Checking complaint 61 on contract:", CONTRACT_ADDRESS);
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Try V1 first
  console.log("\n📋 Trying V1 ABI (no status)...");
  try {
    const contractV1 = new ethers.Contract(CONTRACT_ADDRESS, ABI_V1, provider);
    const complaint = await contractV1.getComplaint(61);
    
    console.log("✅ V1 ABI works! Contract is V1 (no status support)");
    console.log("\nComplaint 61 data:");
    console.log("  ID:", complaint.complaintId.toString());
    console.log("  City:", complaint.city);
    console.log("  Category:", complaint.category);
    console.log("  Recorded by:", complaint.recordedBy);
    console.log("  Timestamp:", new Date(Number(complaint.timestamp) * 1000).toISOString());
    console.log("  Status: ❌ NOT AVAILABLE (V1 contract)");
    
    return "v1";
  } catch (error) {
    console.log("❌ V1 ABI failed:", error.message.substring(0, 100));
  }
  
  // Try V2
  console.log("\n📋 Trying V2 ABI (with status)...");
  try {
    const contractV2 = new ethers.Contract(CONTRACT_ADDRESS, ABI_V2, provider);
    const complaint = await contractV2.getComplaint(61);
    
    console.log("✅ V2 ABI works! Contract is V2 (has status support)");
    console.log("\nComplaint 61 data:");
    console.log("  ID:", complaint.complaintId.toString());
    console.log("  City:", complaint.city);
    console.log("  Category:", complaint.category);
    console.log("  Recorded by:", complaint.recordedBy);
    console.log("  Timestamp:", new Date(Number(complaint.timestamp) * 1000).toISOString());
    console.log("  Status:", Number(complaint.status), "(0=Pending, 1=Resolved, 2=Verified)");
    
    return "v2";
  } catch (error) {
    console.log("❌ V2 ABI failed:", error.message.substring(0, 100));
  }
  
  console.log("\n⚠️  Could not read complaint with either ABI");
}

checkComplaint();
