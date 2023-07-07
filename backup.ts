/*## Backup into JSON file

This will store all NFTs for given `contract_address` in a JSON file with timestamp.

```bash
DB_URL=postgres://user@pass:host[:5432]/dbname  npm run backup <source_contract_address>
```
*/

import { promises as fs } from 'fs';
import { Client } from 'pg';

const { DB_URL } = process.env;
if (!DB_URL) {
  console.error('Missing DB_URL environment variable');
  process.exit(1);
}

let [, , contractAddress] = process.argv;
if (!contractAddress) {
  console.error('Missing contractAddress');
  console.error('Usage: npm run backup <contractAddress>');
  process.exit(1);
}
contractAddress = contractAddress.toLowerCase();
console.log('contractAddress', contractAddress);

const db = new Client({ connectionString: DB_URL });
db.connect();

(async () => {
  const { rows } = await db.query(`SELECT * FROM nft ORDER BY object_id ASC`);
  console.log(`Found total ${rows.length} NFTs in DB`);
  console.log('First NFT', toNFT(rows[0]));

  const nfts = rows.map(toNFT).filter((n) => {
    // console.log(
    //   'n.contract_id',
    //   n.contract_id,
    //   typeof n.contract_id,
    //   contractAddress,
    //   typeof contractAddress,
    //   n.contract_id === contractAddress
    // );
    return n.contract_id === contractAddress;
  });
  if (nfts.length === 0) {
    console.log(`No NFTs found for contract ${contractAddress}`);
    process.exit(1);
  }

  console.log('NFTS', JSON.stringify(nfts, null, 2));

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `./NFTS___${contractAddress}___${timestamp}.json`;

  await fs.writeFile(filename, JSON.stringify(nfts, null, 2));

  console.log(`\n\nBackup saved to ${filename}\n`);

  process.exit(0);
})();

// Helpers

function toNFT(nft: any) {
  return {
    ...nft,
    wallet_id: '0x' + Buffer.from(nft.wallet_id).toString('hex'),
    contract_id: '0x' + Buffer.from(nft.contract_id).toString('hex'),
  };
}
