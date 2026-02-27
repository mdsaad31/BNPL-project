# TrustPay Protocol

> Non-custodial Web3 BNPL (Buy Now, Pay Later) protocol on BNB Chain.

Lock crypto collateral (1.5x ratio), buy products with 4-week installments, and merchants get paid instantly — all trustlessly on-chain.

## Architecture

```
BNPL/
├── contracts/          # Hardhat smart contracts
│   ├── src/
│   │   ├── CollateralVault.sol   # Manages BNB collateral locks
│   │   └── BNPLLoan.sol          # Loan lifecycle & repayment
│   ├── test/
│   │   └── TrustPay.test.js      # Comprehensive test suite
│   ├── scripts/
│   │   └── deploy.js             # Deploy + seed demo data
│   └── hardhat.config.js
│
├── frontend/           # Vite + React + TypeScript
│   └── src/
│       ├── contracts/            # ABIs + deployment addresses
│       ├── context/              # Web3 wallet context
│       ├── hooks/                # useTrustPay, useDevTime
│       ├── components/           # Navbar, Layout, DevPanel
│       └── pages/                # Landing, Shop, Dashboard, Merchant
│
└── package.json        # Root monorepo scripts
```

## Quick Start

### 1. Install Dependencies

```bash
# Install contract dependencies
cd contracts && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Start Local Blockchain

```bash
cd contracts
npx hardhat node
```

### 3. Deploy Contracts (new terminal)

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy `CollateralVault` and `BNPLLoan`
- Register a demo merchant
- Seed 4 sample products
- Copy ABIs + addresses to `frontend/src/contracts/`

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

### 5. Connect MetaMask

- Add Hardhat Network: RPC `http://127.0.0.1:8545`, Chain ID `31337`
- Import test accounts from the Hardhat node output (private keys)

## Demo Flows

### Flow 1: Buyer Purchase
1. Connect wallet → Browse `/shop` → Select product → Confirm 1.5x collateral lock
2. Go to `/dashboard` → See active loan → Pay installments (0.25 BNB each)

### Flow 2: Merchant
1. Connect merchant wallet → Go to `/merchant` → Register store
2. Create product → View incoming orders and payment status

### Flow 3: Default & Liquidation
1. Purchase a product → Use the ⚡ Dev Panel (bottom-right) to fast-forward time
2. Click "+1 Week" → "+3 Days" → Trigger Default on the dashboard
3. Collateral is liquidated: merchant receives outstanding debt, buyer gets refund

## Smart Contracts

| Contract | Purpose |
|----------|---------|
| `CollateralVault` | Locks BNB at 150% ratio. Handles release and liquidation. |
| `BNPLLoan` | Manages loans, products, merchants. 4-installment repayment schedule. |

### Key Parameters
- **Collateral Ratio**: 150% (1.5x product price)
- **Installments**: 4 weekly payments
- **Grace Period**: 3 days after due date

## Testing

```bash
cd contracts
npx hardhat test
```

All 20 tests cover:
- Collateral math (1.5x constraints)
- Merchant registration & product CRUD
- Purchase flow with collateral locking
- Installment payments with merchant forwarding
- Full repayment with collateral release
- Default/liquidation with correct fund distribution

## Tech Stack

- **Smart Contracts**: Solidity 0.8.24, Hardhat, OpenZeppelin
- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS v4
- **Web3**: ethers.js v6
- **Design**: "Dark Forge" cyberpunk-financial aesthetic
