import 'dotenv/config';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractABI = [
  "function mint(address user, uint256 amount) external",
  "function balanceOf(address account) view returns (uint256)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

export { contract, wallet };
