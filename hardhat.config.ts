import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import '@nomicfoundation/hardhat-verify';
import 'hardhat-deploy';
import 'hardhat-contract-sizer';
import '@nomicfoundation/hardhat-foundry';

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.19',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        localhost: {
            url: 'http://127.0.0.1:8545/',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        goerli: {
            chainId: 5,
            url: process.env.INFURA_URI || 'https://goerli.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        holesky: {
            chainId: 17000,
            url: process.env.INFURA_URI || 'https://holesky.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        mainnet: {
            url: process.env.INFURA_URI || 'https://goerli.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        optimism_goerli: {
            chainId: 420,
            url: process.env.OPTIMISM_GOERLI_URI || 'https://goerli.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        arbitrum: {
            chainId: 42161,
            url: process.env.ARBITRUM_URI || 'https://goerli.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        binance: {
            chainId: 56,
            url: process.env.BINANCE_URI || 'https://goerli.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        mode: {
            chainId: 34443,
            url: process.env.MODE_URI || 'https://goerli.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        blast: {
            chainId: 81457,
            url: 'https://rpc.blast.io',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        linea: {
            chainId: 59144,
            url: process.env.LINEA_URI || 'https://goerli.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        base: {
            chainId: 8453,
            url: process.env.BASE_URI || 'https://goerli.infura.io/v3/ZZZ',
            accounts: process.env.PRIVATE_KEY
                ? [process.env.PRIVATE_KEY]
                : {
                      mnemonic: 'test test test test test test test test test test test junk',
                  },
        },
        // hardhat: {
        //     forking: {
        //         url: process.env.TEST_URI || '',
        //     },
        //     accounts: [
        //         { privateKey: process.env.PRIVATE_KEY!, balance: '10000000000000000000000' },
        //     ],
        // },
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY || '',
            goerli: process.env.ETHERSCAN_API_KEY || '',
            holesky: process.env.ETHERSCAN_API_KEY || '',
            optimisticGoerli: process.env.OPTIMISM_API_KEY || '',
            arbitrumOne: process.env.ARBITRUM_API_KEY || '',
            bsc: process.env.BSC_API_KEY || '',
            mode: process.env.ETHERSCAN_API_KEY || '',
            blast: process.env.BLAST_API_KEY || '',
            linea: process.env.LINEA_API_KEY || '',
            base: process.env.BASE_API_KEY || '',
        },
        customChains: [
            {
                network: 'mode',
                chainId: 34443,
                urls: {
                    apiURL: 'https://explorer.mode.network/api',
                    browserURL: 'https://explorer.mode.network',
                },
            },
            {
                network: 'blast',
                chainId: 81457,
                urls: {
                    apiURL: 'https://api.blastscan.io/api',
                    browserURL: 'https://blastscan.io/',
                },
            },
            {
                network: 'linea',
                chainId: 59144,
                urls: {
                    apiURL: 'https://api.lineascan.build/api',
                    browserURL: 'https://lineascan.build/',
                },
            },
            {
                network: 'holesky',
                chainId: 17000,
                urls: {
                    apiURL: 'https://api-holesky.etherscan.io/api',
                    browserURL: 'https://holesky.etherscan.io/',
                },
            },
            {
                network: 'base',
                chainId: 8453,
                urls: {
                    apiURL: 'https://api.basescan.org/api',
                    browserURL: 'https://basescan.org/',
                },
            },
        ],
    },
    namedAccounts: {
        // For deployment scripts under /deploy
        deployer: {
            default: 0, // take the first account as default from the network config
            // This account will deploy contracts and be set as protocol admin and also admin for all proxies
        },
    },
};

export default config;
