import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ABI_V2 = [
  "function getComplaint(uint256 _complaintId) external view returns (tuple(uint256 complaintId, string city, string category, address recordedBy, uint256 timestamp, uint8 status))",
];

async function testContractVersion() {
  console.log("🔍 Testing contract version...");
  console.log("Contract:", CONTRACT_ADDRESS);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI_V2, provider);

  try {
    // Try to fetch complaint 60 (the one you just created)
    const complaint = await contract.getComplaint(60);
    
    console.log("\n✅ Contract is V2 (supports status)!");
    console.log("\nComplaint 60 on-chain:");
    console.log("  ID:", complaint.complaintId.toString());
    console.log("  City:", complaint.city);
    console.log("  Category:", complaint.category);
    console.log("  Status:", Number(complaint.status), "(0=Pending, 1=Resolved, 2=Verified)");
    console.log("  Timestamp:", new Date(Number(complaint.timestamp) * 1000).toISOString());
    
    if (Number(complaint.status) === 0) {
      console.log("\n✨ Status is Pending as expected for new complaints!");
    }

    return true;
  } catch (error) {
    console.error("\n❌ Contract might be V1 (no status support)");
    console.error("Error:", error.message);
    console.log("\n⚠️  You need to deploy ComplaintRegistryV2.sol and update CONTRACT_ADDRESS in .env");
    return false;
  }
}

testContractVersion();
