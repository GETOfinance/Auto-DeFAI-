
## 🚀 Quick Start

### Prerequisites

- [Python 2.7+](https://www.python.org/downloads/)
- [Node.js 23.0.3+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Git](https://git-scm.com/downloads)
- [pnpm](https://pnpm.io/installation)
- [n8n](https://docs.n8n.io/getting-started/installation/) (Required for Coordinator Agent)

> **Note for Windows Users:** [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install-manual) and [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/) are required.

### Installation

```bash
# Clone the repository
git clone https://github.com/GETOfinance/Auto-DeFAI-.git
cd Auto-DeFAI-/eliza

# Install dependencies
pnpm install --no-frozen-lockfile

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` file and add your credentials:

####################################
#### Server & DB Configurations ####
####################################

# Cache Configs

# Required for MultiversX operations
MVX_PRIVATE_KEY=your_private_key
MVX_NETWORK=mainnet  # or devnet or testnet

# Choose an API provider and add the API_KEY on the env file
OPENAI_API_KEY=                # OpenAI API key, starting with sk-

CACHE_STORE=database # Defaults to database. Other available cache store: redis$
REDIS_URL=           # Redis URL - could be a local redis instance or cloud hos$
PGLITE_DATA_DIR=     #../pgLite/ if selecting a directory   --- or memory:// if$

# Eliza Port Config
SERVER_PORT=3000

# Supabase Configuration
SUPABASE_URL=
SUPABASE_ANON_KEY=

# MongoDB
MONGODB_CONNECTION_STRING=             #mongodb connection string
MONGODB_DATABASE=                      #name of the database in mongoDB atlas #$


```

### Running the Agent

```bash
# Build the project
pnpm build

# Start a single agent (Recommended for testing)
pnpm start:debug --characters="characters/demo1-agent.character.json"

# Start demo agents (5)
pnpm start --characters="characters/demo-agent.character.json,characters/metrics-agent.character.json,characters/sales-agent.character.json,characters/meme-agent.character.json,characters/multiversx-expert-agent.character.json"

# Start all agents (18)
pnpm start --characters="characters/coordinator.character.json,characters/metrics-agent.character.json,characters/sales-agent.character.json,characters/meme-agent.character.json,characters/nfts-agent.character.json,characters/alpha-agent.character.json,characters/analyst-agent.character.json,characters/trading-agent.character.json,characters/wallet-agent.character.json,characters/dao-agent.character.json,characters/defi-agent.character.json,characters/demo-agent.character.json,characters/kol-agent.character.json,characters/token-deployer-agent.character.json,characters/nft-deployer-agent.character.json,characters/multiversx-expert-agent.character.json,characters/predictions-agent.character.json,characters/advisor-agent.character.json"
```

### Running the Web Client

In a new terminal, run the following command:

```bash
cd client
pnpm run dev
```
