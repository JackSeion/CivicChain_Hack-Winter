// Blockchain service for interacting with Ethereum Sepolia network
import { ethers } from 'ethers';
import { supabase } from './supabase';

// Sepolia network configuration
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'; // Replace with your Infura or Alchemy key
const SEPOLIA_CHAIN_ID = 11155111;

// Contract address (if you have deployed a smart contract)
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with your deployed contract address

/**
 * Get blockchain transaction hash for a complaint
 * Fetches tx_hash directly from Supabase complaints table
 */
export async function getBlockchainHash(complaintId: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('tx_hash')
      .eq('id', complaintId)
      .single();

    if (error) {
      console.error('Error fetching complaint from Supabase:', error);
      return null;
    }

    return data?.tx_hash || null;
  } catch (error) {
    console.error('Error fetching blockchain hash:', error);
    return null;
  }
}

/**
 * Submit a complaint to the blockchain
 * This would be called when creating a new complaint
 */
export async function submitToBlockchain(
  complaintId: number,
  title: string,
  description: string,
  location: { latitude: number; longitude: number }
): Promise<string | null> {
  try {
    // This is where you would submit the complaint data to the blockchain
    // Example using ethers.js:
    
    // const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    // const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    // const tx = await contract.submitComplaint(
    //   complaintId,
    //   ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify({
    //     title,
    //     description,
    //     location
    //   })))
    // );
    
    // await tx.wait();
    // return tx.hash;

    // For now, return null (demo mode)
    return null;
  } catch (error) {
    console.error('Error submitting to blockchain:', error);
    return null;
  }
}

/**
 * Generate a demo transaction hash for demonstration purposes
 * In production, this should be replaced with actual blockchain integration
 */
export function generateDemoHash(complaintId: number): string {
  // Create a deterministic hash based on complaint ID
  // This is just for demo - in production, use real blockchain transaction hash
  const hash = ethers.keccak256(
    ethers.toUtf8Bytes(`complaint_${complaintId}_${Date.now()}`)
  );
  return hash;
}

/**
 * Get Sepolia Etherscan URL for a transaction
 */
export function getSepoliaExplorerUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

/**
 * Verify if a transaction hash is valid
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}
