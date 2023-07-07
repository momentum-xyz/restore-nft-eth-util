# Odyssey NFT restoring tool - Ethereum

This tool allows fetching NFTs info from DB and store them in a JSON file and later restore them in to a new NFT contract.

## Backup into JSON file

This will store all NFTs for given `contract_address` in a JSON file with timestamp.

You need to provide a `DB_URL` env variable.

```bash
export DB_URL=postgres://user@pass:host[:5432]/dbname

npm run backup <source_contract_address>
```

## Restore from JSON file

This will restore all NFTs from a JSON file into a new contract.

You need to provide a private key for the contract admin account and a JSON RPC URL (default is `http://127.0.0.1:8545`).

```bash
export ETH_PRIVATE_KEY=0x12312a122313123123123

# export JSON_RPC_URL=https://mainnet.infura.io/v3/123123123

npm run restore <destination_contract_address> <backup_json_filename>
```

Here's how to [retrive the account's private key in MetaMask](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key).
