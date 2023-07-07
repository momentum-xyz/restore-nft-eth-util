import fs from 'fs';
import { ethers } from 'ethers';
import ABI from './ABI_NFT.json';

const { ETH_PRIVATE_KEY, JSON_RPC_URL = 'http://127.0.0.1:8545' } = process.env;
if (!ETH_PRIVATE_KEY) {
  console.error('Missing ETH_PRIVATE_KEY environment variable');
  process.exit(1);
}

const [, , contractAddress, filename] = process.argv;
if (!contractAddress || !filename) {
  usage();
}

// Load from JSON file

const nftsStr = fs.readFileSync(filename, 'utf8');
let nfts = JSON.parse(nftsStr) as NFT[];
nfts.sort((a, b) => a.object_id.localeCompare(b.object_id));
console.log(`Found ${nfts.length} NFTs`);
console.log('First NFT', JSON.stringify(nfts[0], null, 2));

// Connect to contract

const provider = new ethers.JsonRpcProvider(JSON_RPC_URL);
const wallet = new ethers.Wallet(ETH_PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, ABI, wallet);

// Restore NFTs

async function main() {
  const res = await contract.name();
  console.log('Contract NAME', res);

  const firstUpcomingId = await fetchUpcomingId();
  console.log('firstUpcomingId', firstUpcomingId);
  nfts = nfts.filter((n) => {
    if (n.object_id < firstUpcomingId) {
      console.log('Skipping', n.object_id, 'because it is already minted');
      return false;
    }
    return true;
  });

  for (const { object_id, wallet_id } of nfts) {
    console.log('Process', { object_id, wallet_id });

    const upcomingId = await fetchUpcomingId();
    console.log('upcomingId', upcomingId, typeof upcomingId);

    if (object_id !== upcomingId) {
      console.log(
        'Unexpected object_id',
        object_id,
        'does not match expected',
        upcomingId,
        '- Stop!'
      );
      process.exit(1);
    }

    const nonce = await wallet.getNonce();
    console.log('nonce', nonce);

    const tx = await contract.safeMint(wallet_id, { nonce });
    console.log('tx', tx.hash);

    await provider.waitForTransaction(tx.hash);
  }

  console.log('Done');
}

// Helpers

async function fetchUpcomingId() {
  const currentId = await contract.currentId();
  const nextId = currentId + 1n;
  const suffix = nextId.toString(16).padStart(12, '0').slice(-12);
  console.log('Next odyssey id', nextId);
  return '00000000-0000-8000-8000-' + suffix;
}

function usage() {
  console.error('Usage: npm run restore <contractAddress> <filename>');
  process.exit(1);
}

interface NFT {
  wallet_id: string;
  blockchain_id: string;
  object_id: string;
  contract_id: string;
  created_at: string;
  updated_at: string;
}

main().catch(console.error);
