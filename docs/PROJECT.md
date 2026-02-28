<div align="center">

# ◆ NexaPay — Project Overview

### Problem · Solution · Impact · Roadmap

</div>

---

## ✦ The Problem

### Traditional BNPL is broken.

| Pain Point | Explanation |
|:---|:---|
| **Centralized & Custodial** | Klarna, Afterpay, and Affirm hold user data and funds in centralized databases. One breach = millions exposed. |
| **Credit Gatekeeping** | Credit score requirements exclude 1.7B unbanked people globally. Good behavior means nothing without a FICO score. |
| **Slow Merchant Settlement** | Merchants wait 2–30 days for settlement. Cash flow strangles small businesses. |
| **Chargeback Fraud** | Merchants lose ~$125B/year globally to chargebacks and friendly fraud. |
| **No Web3 Alternative** | DeFi has lending (Aave, Compound) but **zero structured installment payment protocols**. |
| **No On-Chain Credit History** | Wallets have rich transaction history but no way to build a reputation from it. |

### The gap is clear:

> **There is no non-custodial way to split an on-chain purchase into installments, where merchants get paid instantly and buyers are protected by collateral — not credit scores.**

---

## ✦ The Solution

### NexaPay: Trustless BNPL on BNB Chain

NexaPay is a **non-custodial Buy Now Pay Later protocol** that uses over-collateralization instead of credit checks.

### How it works:

```
┌─────────────────────────────────────────────────────────────┐
│                     BNPL PURCHASE FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Buyer selects product (e.g. 1 BNB)                        │
│       ↓                                                      │
│   Buyer locks 1.5 BNB collateral into CollateralVault        │
│       ↓                                                      │
│   BNPLLoan contract pays merchant 1 BNB instantly            │
│       ↓                                                      │
│   Buyer repays 0.25 BNB × 4 weekly installments              │
│       ↓                                                      │
│   All 4 paid → 1.5 BNB collateral released back              │
│       ↓                                                      │
│   Aura score updated ✓                                       │
│                                                              │
│   ⚠️ If buyer defaults after grace period:                   │
│       → Outstanding debt sent to treasury                     │
│       → Remainder refunded to buyer                           │
│       → Aura score penalized                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### NFT Lending Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                     NFT LENDING FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User locks ERC-721 NFT into NFTCollateralLoan              │
│       ↓                                                      │
│   Protocol lends BNB at 50% LTV of treasury value            │
│       ↓                                                      │
│   User repays loan + 5% interest within 30 days              │
│       ↓                                                      │
│   NFT returned to user ✓                                     │
│                                                              │
│   ⚠️ If borrower defaults after 30 days:                     │
│       → NFT is liquidated (retained by protocol)              │
│       → Loan written off                                      │
│       → Aura score penalized                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✦ Key Innovations

### 1. Instant Merchant Settlement

Unlike every traditional BNPL service, **merchants are paid the full product price at the moment of purchase**. No waiting. No settlement batches. The buyer's collateral guarantees the protocol can afford this.

### 2. Aura — On-Chain Credit Scoring

NexaPay computes a **0–1000 reputation score** from 6 weighted factors derived entirely from on-chain activity:

| Factor | Weight | Signal |
|:---|:---|:---|
| Repayment Reliability | 40% | Repaid loans vs. defaults |
| Payment Discipline | 25% | On-time vs. late payments |
| Borrowing Experience | 15% | Loan history depth |
| Portfolio Diversity | 8% | Mix of BNPL + NFT loans |
| Collateral Behavior | 6% | Proper collateral claims |
| NFT Lending Record | 6% | NFT loan repayment history |

This creates a **portable, composable credit identity** that any dApp can read. No oracle needed — it's computed client-side from public chain data.

### 3. Dual Collateral Model

- **BNB Collateral** (150% ratio) for BNPL purchases
- **NFT Collateral** (50% LTV) for BNB loans

Two pathways for users to access credit based on what they already hold.

---

## ✦ Impact

### Immediate Impact (Hackathon)

| Metric | Detail |
|:---|:---|
| **4 Smart Contracts** | Deployed and functional on BSC Testnet |
| **6 Frontend Pages** | Landing, Shop, Dashboard, Merchant, NFT Loans, Aura |
| **20 Automated Tests** | Full coverage of collateral, loans, and liquidation |
| **Dockerized** | `docker compose up` runs the entire stack |
| **Live Deployment** | Netlify frontend + BSC Testnet contracts |

### Potential Impact (At Scale)

| Area | Projection |
|:---|:---|
| **Financial Inclusion** | Collateral-based BNPL requires no credit history — accessible to the 1.7B unbanked |
| **Merchant Adoption** | Instant settlement + zero chargebacks = compelling value prop for Web3 merchants |
| **DeFi Composability** | Aura scores can integrate with other protocols for dynamic interest rates, whitelists, airdrop eligibility |
| **BNB Ecosystem** | Brings a missing DeFi primitive to BNB Chain, increasing TVL and user engagement |

### Social Impact

> NexaPay reimagines credit not as a gatekeeping tool, but as a **transparent, on-chain reputation** that anyone can build through responsible behavior — regardless of geography, background, or banking status.

---

## ✦ Problem → Solution Clarity

| Problem | NexaPay Solution |
|:---|:---|
| BNPL requires credit scores | Collateral-based (150% BNB lock) |
| Merchants wait weeks for payment | Instant on-chain settlement |
| No on-chain credit identity | Aura Score (6-factor, 0–1000) |
| NFT liquidity without selling | NFT-backed BNB loans (50% LTV) |
| DeFi has no installment payments | 4-installment weekly repayment schedule |
| Chargebacks cost merchants billions | Collateral eliminates fraud risk entirely |
| BNPL protocols don't exist on BNB | NexaPay fills the gap |

---

## ✦ Roadmap

```
2026
═════════════════════════════════════════════════════════

  Q1 ──── Hackathon MVP ✅
  │       ├── Core BNPL (4-installment, 150% collateral)
  │       ├── NFT-backed lending (50% LTV, 5% interest)
  │       ├── Aura credit scoring engine (6 factors)
  │       ├── Full Docker + Netlify deployment
  │       └── 20 automated tests
  │
  Q2 ──── Mainnet Launch
  │       ├── BNB Chain mainnet deployment
  │       ├── Professional security audit
  │       ├── Merchant onboarding SDK
  │       └── BNB Greenfield for product metadata
  │
  Q3 ──── Ecosystem Expansion
  │       ├── Aura Score API (third-party integrations)
  │       ├── opBNB integration (gasless micro-payments)
  │       ├── BEP-20 token collateral support
  │       └── Dynamic interest rates based on Aura
  │
  Q4 ──── Cross-Chain
  │       ├── LayerZero / Wormhole bridge for cross-chain BNPL
  │       ├── Multi-chain Aura score aggregation
  │       └── Institutional merchant partnerships

2027
═════════════════════════════════════════════════════════

  H1 ──── Consumer Scale
  │       ├── Mobile wallet app (React Native)
  │       ├── Fiat on-ramp integration
  │       ├── Credit delegation (stake Aura for others)
  │       └── Subscription-based BNPL plans
  │
  H2 ──── Protocol Maturity
          ├── Governance framework
          ├── Insurance fund for liquidation protection
          └── B2B API for e-commerce integrations
```

---

<div align="center">

**NexaPay — Because your wallet said no, but the blockchain said maybe.**

</div>
