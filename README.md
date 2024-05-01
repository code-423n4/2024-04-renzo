# Renzo audit details
- Total Prize Pool: $112,500 in USDC
  - HM awards: $63,500 in USDC
  - QA awards: $3,000 in USDC
  - Judge awards: $11,300 in USDC
  - Validator awards: $5,200 USDC
  - Scout awards: $500 in USDC
  - Mitigation Review: $29,000 in USDC
- Join [C4 Discord](https://discord.gg/code4rena) to register
- Submit findings [using the C4 form](https://code4rena.com/contests/2024-04-renzo/submit)
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts April 30, 2024 20:00 UTC
- Ends May 8, 2024 20:00 UTC

## Automated Findings / Publicly Known Issues

The 4naly3er report can be found [here](https://github.com/code-423n4/2024-04-renzo/blob/main/4naly3er-report.md).

_Note for C4 wardens: Anything included in this `Automated Findings / Publicly Known Issues` section is considered a publicly known issue and is ineligible for awards._

Known Risks
- Incorrect configuration being set or admin privileged functions causing invalid configuration
- Administrative centralization (protocol is becoming decentralized over time)
- Node Operator deposit front runs


# Overview

Renzo is a Liquid Restaking Token (LRT) and Strategy Manager for EigenLayer. It is the interface to the EigenLayer ecosystem securing Actively Validated Services (AVSs) and offering a higher yield than ETH staking.

The protocol abstracts all complexity from the end-user and enables easy collaboration between users and EigenLayer node operators.

## Contracts

```jsx
contracts
├── Bridge
│   ├── Connext - "Connext Interface Contract and Libraries used in the protocol"
│   ├── L1
│   │   ├── IxRenzoBridge.sol - "Interface of xRenzoBridge used by caller contract"
│   │   ├── xRenzoBridge.sol - "L1 Bridge Contract which sends price feed to supported L2s and receiving ETH from different L2s"
│   │   └── xRenzoBridgeStorage.sol - "Storage contract for xRenzoBridge"
│   ├── L2
│   │   ├── Oracle
│   │   │   ├── IRenzoOracleL2.sol - "Interface of RenzoOracle on L2"
│   │   │   ├── RenzoOracleL2.sol - "Wrapper Oracle contract to fetch ezETH price on L2 from configured price feeds"
│   │   │   └── RenzoOracleL2Storage.sol - "Storage contract for RenzoOracleL2"
│   │   ├── PriceFeed
│   │   │   ├── CCIPReceiver.sol - "CCIP Receiver contract on L2 to receive price feed from L1"
│   │   │   └── ConnextReceiver.sol - "Connext Receiver contract on L2 to receive price feed from L1"
│   │   ├── IxRenzoDeposit.sol - "Interface of xRenzoDeposit user by caller contract"
│   │   ├── xRenzoDeposit.sol - "User facing deposit contract on supported L2s"
│   │   └── xRenzoDepositStorage.sol - "Storage contract for xRenzoDeposit"
│   └── xERC20
│       ├── contracts
│       │   ├── XERC20.sol - "XERC20 token contract"
│       │   ├── XERC20Factory.sol - "XERC20Factory contract responsible to deploy XERC20 and XERC20Lockbox"
│       │   ├── XERC20Lockbox.sol - "XERC20 Lockbox contract"
│       │   └── optimism
│       │       ├── OptimismMintableXERC20.sol - "extended version of XERC20 supported by native optimistic bridge"
│       │       └── OptimismMintableXERC20Factory.sol - "Storage contract for OptimismMintableXERC20"
│       └── interfaces
│           ├── IOptimismMintableERC20.sol - "Interface of OptimismMintableXERC20"
│           ├── IXERC20.sol - "Interface of XERC20"
│           ├── IXERC20Factory.sol - "Interface of IXERC20Factory"
│           └── IXERC20Lockbox.sol - "Interface of IXERC20Lockbox"
├── Delegation
│   ├── IOperatorDelegator.sol - "Interface of OperatorDelegator"
│   ├── OperatorDelegator.sol - "Oprator delegator contract responsible for interacting with EigenLayer"
│   └── OperatorDelegatorStorage.sol - "Storage contract for OperatorDelegator"
├── Deposits
│   ├── DepositQueue.sol - "Deposit Queue contract responsible to deposit native ETH to Beacon chain and fill the withdraw buffer"
│   ├── DepositQueueStorage.sol - "Storage contract for DepositQueue"
│   └── IDepositQueue.sol - "Interface of DepositQueue"
├── EigenLayer - "EigenLayer Interfaces and Libraries used"
├── Errors
│   └── Errors.sol - "Contains all the custom errors"
├── Oracle
│   ├── Binance - "The contracts hard codes the decimals to 18 decimals and returns the conversion rate of 1 wBETH to ETH underlying the token in the wBETH protocol" 
│   │   ├── IStakedTokenV2.sol
│   │   ├── WBETHShim.sol
│   │   └── WBETHShimStorage.sol
│   ├── Mantle - "The contracts hard codes the decimals to 18 decimals and returns the conversion rate of 1 mETH to ETH underlying the token in the mETH protocol"
│   │   ├── IMethStaking.sol
│   │   ├── METHShim.sol
│   │   └── METHShimStorage.sol
│   ├── IRenzoOracle.sol - "Interface of Renzo Oracle"
│   ├── RenzoOracle.sol - "Responsible for getting mint/burn amounts and collateral token value lookup from configured price feeds on L1"
│   └── RenzoOracleStorage.sol - "Storage contract for RenzoOracle on L1"
├── Permissions
│   ├── IRoleManager.sol - "Interface of RoleManager used by caller contracts"
│   ├── RoleManager.sol - "Access Control contract of the protocol"
│   └── RoleManagerStorage.sol - "Storage Contract of RoleManager"
├── RateProvider
│   ├── BalancerRateProvider.sol - "Contract to Provide Mint Rate of LRT(ezETH)"
│   ├── BalancerRateProviderStorage.sol - "Storage contract of BalancerRateProvider"
│   └── IRateProvider.sol - "Interface of BalancerRateProvider used by caller contracts"
├── RestakeManager.sol  - "Users interact with this contract for deposits"
├── RestakeManagerStorage.sol - "Storage contract for RestakeManager"
├── IRestakeManager.sol - "Interface for RestakeManager"
├── Rewards
│   ├── RewardHandler.sol - "Handle the rewards coming from Eigen Layer"
│   └── RewardHandlerStorage.sol - "Storage contract for RewardHandler Contract"
├── Withdraw
│   ├── IWithdrawQueue.sol - "Interface of WithdrawQueue"
│   ├── WithdrawQueue.sol - "Handles ezETH withdraw requests of users"
│   └── WithdrawQueueStorage.sol - "Storage contract for WithdrawQueue"
└── token
    ├── EzEthToken.sol - "Renzo restaked Token"
    ├── EzEthTokenStorage.sol - "Storage contract for EzEthToken"
    └── IEzEthToken.sol - "Interface of EzEthToken"
```

## Links

- Previous Audits - [Halborn](https://github.com/Renzo-Protocol/contracts-public/blob/master/Audit/Renzo_Protocol_EVM_Contracts_Smart_Contract_Security_Assessment.pdf).
- [Renzo Website](https://www.renzoprotocol.com/)
- [Documentation](https://docs.renzoprotocol.com/docs)
- [Twitter](https://twitter.com/RenzoProtocol)
- [Discord](https://discord.gg/FMwGPDXXtf)
- [Mirror](https://mirror.xyz/renzoprotocol.eth)
- [Telegram](https://t.me/RenzoProtocolChat)



## Deposit Collateral Flow

To deposit collateral, you must choose which ERC20 collateral token you want to deposit and how much. You can deposit multiple times with different tokens.

To deposit collateral:

1. Approve the RestakeManager to spend your token
2. Call deposit() on the RestakeManager with the token address and amount of collateral you want to deposit

You can do this by interacting with the contracts directly on Etherscan. Ensure you go to the address, then Contract -> Write as Proxy tabs since all these contracts are proxies.

Note that all amounts are in wei so you will need to convert to base units (1 ETH = 10^18 wei). You can use a tool like [https://eth-converter.com/](https://eth-converter.com/) to do this.

When you call deposit(), it will:

- Move your collateral into the RestakeManager
- Deposit your collateral into EigenLayer
- Mint ezETH to your address corresponding to the amount of collateral you deposited

**Note:** all the assets are priced in ETH denominations. i.e stETH/ETH, wbETH/ETH, ezETH/ETH.

## Withdraw Flow

The withdraw flow is a 2 step process. First you will need to sumbit your withdraw request, then wait the timeout period (7 days on mainnet), and finally complete the withdraw.

When you submit your withdraw request, it will:

- Move your ezETH into the RestakeManager that will be burned
- Calculate how much of the staked tokens you are withdrawing for your collateral value
- Start a withdraw on EigenLayer

When you complete your withdraw, it will:

- Complete the withdraw on EigenLayer
- Burn your ezETH
- Send the collateral back to your wallet

To submit a withdraw request:

- Calculate how much ezETH you want to burn in base units (e.g. 5000000000000000 for 0.005 ezETH)
- Call approve() on the ezETH contract to approve the RestakeManager to move your ezETH
- Call startWithdraw() on the RestakeManager with the amount of ezETH you want to burn and which collateral token you would like to get back

When this transaction is complete you will see:

- Your ezETH has been moved into the RestakeManager
- On Etherscan you will see events from EigenLayer that show a bunch of details
  - Look at transaction -> Logs on Etherscan
  - The 2 logs you will want to use in the next step are:
    - ShareWithdrawalQueued
    - WithdrawalQueued

After the delay has passed, you can complete your withdraw:

- Call completeWithdraw() on the RestakeManager
  - The parameters can be found in the event logs from the previous step
  - Note that some of the parameters require putting into an array using the "[" and "]" characters
  - Note that withdrawalStartBlock is the block number from the tx in the previous step
  - middlewareTimesIndex is 0


### Note on withdrawing

Note that the protocol must have at least the collateral you are requesting to be delegated to a single Operator in order to withdraw that amount. For example if the protocol has 100 stETH delegated to Operator 1 and 50 stETH delegated to Operator 2, the maximum stETH you can request to withdraw is 100. If you request 110 stETH, the tx will fail. Instead you can perform 2 withdrawals, one for 100 stETH and one for 10 stETH.



---

# Scope

*See [scope.txt](https://github.com/code-423n4/2024-04-renzo/blob/main/scope.txt)*

### Files in scope

| File   | Logic Contracts | Interfaces | SLOC  | Purpose | Libraries used |
| ------ | --------------- | ---------- | ----- | -----   | ------------ |
| /contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol | 1| 2 | 66 | |@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol<br>@openzeppelin/contracts/token/ERC20/IERC20.sol|
| /contracts/Bridge/Connext/libraries/LibConnextStorage.sol | ****| **** | 29 | ||
| /contracts/Bridge/Connext/libraries/TokenId.sol | ****| **** | 5 | ||
| /contracts/Bridge/L1/xRenzoBridge.sol | 1| **** | 205 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol<br>@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol<br>@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol|
| /contracts/Bridge/L1/xRenzoBridgeStorage.sol | 1| **** | 26 | |@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol<br>@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol<br>@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol|
| /contracts/Bridge/L2/Oracle/RenzoOracleL2.sol | 1| **** | 34 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol|
| /contracts/Bridge/L2/Oracle/RenzoOracleL2Storage.sol | 1| **** | 6 | |@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol|
| /contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol | 1| **** | 73 | |@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol<br>@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol<br>@openzeppelin/contracts/access/Ownable.sol<br>@openzeppelin/contracts/security/Pausable.sol|
| /contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol | 1| **** | 71 | |@connext/interfaces/core/IXReceiver.sol<br>@openzeppelin/contracts/access/Ownable.sol<br>@openzeppelin/contracts/security/Pausable.sol|
| /contracts/Bridge/L2/xRenzoDeposit.sol | 1| **** | 274 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol|
| /contracts/Bridge/L2/xRenzoDepositStorage.sol | 3| **** | 27 | |@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol|
| /contracts/Bridge/xERC20/contracts/XERC20.sol | 1| **** | 173 | |@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol<br>@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol|
| /contracts/Bridge/xERC20/contracts/XERC20Factory.sol | 1| **** | 110 | |solmate/utils/CREATE3.sol<br>@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol|
| /contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol | 1| **** | 64 | |@openzeppelin/contracts/token/ERC20/ERC20.sol<br>@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol<br>@openzeppelin/contracts/utils/math/SafeCast.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol|
| /contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol | 1| **** | 44 | |@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol|
| /contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol | 1| **** | 73 | |solmate/utils/CREATE3.sol<br>@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol|
| /contracts/Delegation/OperatorDelegator.sol | 1| **** | 321 | |@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol<br>@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol|
| /contracts/Delegation/OperatorDelegatorStorage.sol | 4| **** | 29 | ||
| /contracts/Deposits/DepositQueue.sol | 1| **** | 179 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol<br>@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol|
| /contracts/Deposits/DepositQueueStorage.sol | 2| **** | 15 | ||
| /contracts/Errors/Errors.sol | ****| **** | 49 | ||
| /contracts/Oracle/Binance/WBETHShim.sol | 1| **** | 52 | |@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol|
| /contracts/Oracle/Binance/WBETHShimStorage.sol | 1| **** | 6 | |@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol|
| /contracts/Oracle/Mantle/METHShim.sol | 1| **** | 52 | |@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol|
| /contracts/Oracle/Mantle/METHShimStorage.sol | 1| **** | 6 | |@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol|
| /contracts/Oracle/RenzoOracle.sol | 1| **** | 98 | |@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol|
| /contracts/Oracle/RenzoOracleStorage.sol | 1| **** | 8 | |@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol<br>@openzeppelin/contracts/token/ERC20/IERC20.sol|
| /contracts/Permissions/RoleManager.sol | 1| **** | 51 | |@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol|
| /contracts/Permissions/RoleManagerStorage.sol | 3| **** | 18 | ||
| /contracts/RateProvider/BalancerRateProvider.sol | 1| **** | 25 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol|
| /contracts/RateProvider/BalancerRateProviderStorage.sol | 1| **** | 7 | |@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol|
| /contracts/RestakeManager.sol | 1| **** | 435 | |@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol<br>@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol<br>@openzeppelin/contracts/token/ERC20/IERC20.sol<br>@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol|
| /contracts/RestakeManagerStorage.sol | 2| **** | 36 | ||
| /contracts/Rewards/RewardHandler.sol | 1| **** | 48 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol|
| /contracts/Rewards/RewardHandlerStorage.sol | 1| **** | 6 | ||
| /contracts/TimelockController.sol | 1| **** | 230 | |@openzeppelin/contracts/access/AccessControl.sol<br>@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol<br>@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol|
| /contracts/Withdraw/WithdrawQueue.sol | 1| **** | 193 | |@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol<br>@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol<br>@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol<br>@openzeppelin/contracts/token/ERC20/IERC20.sol|
| /contracts/Withdraw/WithdrawQueueStorage.sol | 1| **** | 28 | ||
| /contracts/token/EzEthToken.sol | 1| **** | 53 | |@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol|
| /contracts/token/EzEthTokenStorage.sol | 1| **** | 6 | ||
| **Totals** | **46** | **2** | **3231** | | |

### Files out of scope

*See [out_of_scope.txt](https://github.com/code-423n4/2024-04-renzo/blob/main/out_of_scope.txt)*


| File                                                            |
|-----------------------------------------------------------------|
| ./contracts/Bridge/Connext/core/IConnext.sol                    |
| ./contracts/Bridge/Connext/core/IWeth.sol                       |
| ./contracts/Bridge/Connext/core/IXReceiver.sol                  |
| ./contracts/Bridge/L1/IxRenzoBridge.sol                         |
| ./contracts/Bridge/L2/IxRenzoDeposit.sol                        |
| ./contracts/Bridge/L2/Oracle/IRenzoOracleL2.sol                 |
| ./contracts/Bridge/xERC20/interfaces/IOptimismMintableERC20.sol |
| ./contracts/Bridge/xERC20/interfaces/IXERC20.sol                |
| ./contracts/Bridge/xERC20/interfaces/IXERC20Factory.sol         |
| ./contracts/Bridge/xERC20/interfaces/IXERC20Lockbox.sol         |
| ./contracts/Delegation/IOperatorDelegator.sol                   |
| ./contracts/Deposits/IDepositQueue.sol                          |
| ./contracts/EigenLayer/interfaces/IAVSDirectory.sol             |
| ./contracts/EigenLayer/interfaces/IBeaconChainOracle.sol        |
| ./contracts/EigenLayer/interfaces/IDelayedWithdrawalRouter.sol  |
| ./contracts/EigenLayer/interfaces/IDelegationFaucet.sol         |
| ./contracts/EigenLayer/interfaces/IDelegationManager.sol        |
| ./contracts/EigenLayer/interfaces/IEigenPod.sol                 |
| ./contracts/EigenLayer/interfaces/IEigenPodManager.sol          |
| ./contracts/EigenLayer/interfaces/IETHPOSDeposit.sol            |
| ./contracts/EigenLayer/interfaces/IPausable.sol                 |
| ./contracts/EigenLayer/interfaces/IPauserRegistry.sol           |
| ./contracts/EigenLayer/interfaces/ISignatureUtils.sol           |
| ./contracts/EigenLayer/interfaces/ISlasher.sol                  |
| ./contracts/EigenLayer/interfaces/ISocketUpdater.sol            |
| ./contracts/EigenLayer/interfaces/IStrategy.sol                 |
| ./contracts/EigenLayer/interfaces/IStrategyManager.sol          |
| ./contracts/EigenLayer/interfaces/IWhitelister.sol              |
| ./contracts/EigenLayer/libraries/BeaconChainProofs.sol          |
| ./contracts/EigenLayer/libraries/BytesLib.sol                   |
| ./contracts/EigenLayer/libraries/EIP1271SignatureUtils.sol      |
| ./contracts/EigenLayer/libraries/Endian.sol                     |
| ./contracts/EigenLayer/libraries/Merkle.sol                     |
| ./contracts/EigenLayer/libraries/StructuredLinkedList.sol       |
| ./contracts/IRestakeManager.sol                                 |
| ./contracts/Oracle/Binance/IStakedTokenV2.sol                   |
| ./contracts/Oracle/IRenzoOracle.sol                             |
| ./contracts/Oracle/Mantle/IMethStaking.sol                      |
| ./contracts/Permissions/IRoleManager.sol                        |
| ./contracts/RateProvider/IRateProvider.sol                      |
| ./contracts/token/IEzEthToken.sol                               |
| ./contracts/Withdraw/IWithdrawQueue.sol                         |
| Totals: 42                                                      |

## Scoping Q &amp; A

### General questions


| Question                                | Answer                       |
| --------------------------------------- | ---------------------------- |
| ERC20 used by the protocol              |       ezETH, stETH, wBETH             |
| Test coverage                           |       -                      |
| ERC721 used  by the protocol            |            None              |
| ERC777 used by the protocol             |           None                |
| ERC1155 used by the protocol            |              None            |
| Chains the protocol will be deployed on | Ethereum Mainnet <br> L2-Specific-contracts deployed on: Base, Arbitrum, Linea, BSC, Mode <br> xERC20 only: Blast  |


### External integrations (e.g., Uniswap) behavior in scope:


| Question                                                  | Answer |
| --------------------------------------------------------- | ------ |
| Enabling/disabling fees (e.g. Blur disables/enables fees) | No   |
| Pausability (e.g. Uniswap pool gets paused)               |  No   |
| Upgradeability (e.g. Uniswap gets upgraded)               |   No  |


### EIP compliance checklist
N/A


# Additional context

## Main invariants

* ezETH should be minted or redeemed based on current supply and TVL.
* Any rewards earned by the protocol should be redeposited (minus a protocol fee).
* Non-privileged accounts should not be able to modify configuration.


## Attack ideas (where to focus for bugs)
Integrity of TVL calculations (ezETH Pricing) - a user should not be able to manipulate the protocol to mint or withdraw at invalid prices


## All trusted roles in the protocol

|                Role                | Description |
|:----------------------------------:|:-----------:|
| RX_ETH_MINTER_BURNER               | minter/burner role for ezETH             |
| OPERATOR_DELEGATOR_ADMIN           |      allows the admin to set token strategy, delegation address and base gas amount spent       |
| ORACLE_ADMIN                       | allows the admin to set price feed oracle for ERC20 oracle            |
| RESTAKE_MANAGER_ADMIN              | allows the admin to configure operatorDelegators(add/remove, allocations), supported collateral tokens and their respective TVL            |
| TOKEN_ADMIN                        | allows admin to pause/unpause the ezETH token            |
| NATIVE_ETH_RESTAKE_ADMIN           | allow the admin to stake/unstake to/from EigenLayer by submitting the proofs             |
| ERC20_REWARD_ADMIN                 | allows the admin to sweep any accumulated ERC20 tokens in DepositQueue contract to the RestakeManager            |
| DEPOSIT_WITHDRAW_PAUSER            | allows the admin to pause/unpause deposits and withdraws            |
| RoleManagerAdmin                   | Default admin of RoleManager            |
| DefaultProxyAdmin Owner (Upgrades) | allows to perform upgrades. currently owner configured to timeLock with a time delay of 3 days             |

## Describe any novel or unique curve logic or mathematical models implemented in the contracts:

N/A



## Compiling

```bash
git clone --recurse-submodules https://github.com/code-423n4/2024-04-renzo.git
cd 2024-04-renzo
npm install
npm run compile
```



## Other Features

### Deposit Caps

The protocol has the ability to set a cap on deposits. A value in RestakeManager `maxDepositTVL` can be set by the restake admin. If this value is set, the contract will revert on any deposits if that would push it above the max TVL.

### ezETH Transfer Restrictions

When the protocol launches, it is intended to not have ezETH be transferrable. A user will deposit and get ezETH minted to their account, but they will not be able to transfer it out of their account until the protocol is ready to allow it. If the withdrawal flow is enabled, they can still withdraw from the protocol (token can be minted and burned by RestakeManager, even if transfers are restricted).

### Native ETH Deposit

The protocol allows users to deposit native ETH to be staked by a validator.

- The user will deposit ETH into the RestakeManager
- The RestakeManager will deposit the ETH into the DepositQueue
- The user will be minted ezETH proportional to their contribution to the total TVL

Once the deposit queue reaches 32 ETH

- A validator will be commissioned outside the protocol with the withdrawal credentials set to a specific EigenPod and the Execution Rewards address set to the DepositQueue
- The OperatorDelegator associated with the EigenPod will call stake() on the EigenPod Manager and send the 32 ETH to the deposit contract
- Once the deposit is confirmed, the OD will call verifyWithdrawalCredentials() on the EigenPod and shares will be allocated to the OD

### Protocol Fees

Fees accumulated in the protocol should be sent to the DepositQueue contract. The configuration in the DepositQueue contract will determine whether fees are configured or not. This includes the destination where all fees are sent and the percentage in basis points. 100 basis points = 1%.

Native ETH earned from outside EigenLayer (such as Execution Layer Rewards or MEV) will be sent to the DepositQueue receive() function. The protocol will then forward a configured fee percentage to an external address.

ERC20 rewards earned in EigenLayer will be sent to the DepositQueue address. The protocol can then sweep the ERC20 fee percentage to the target address and deposit the remaining ERC20 tokens into the protocol through an Operator Delegator.

## Miscellaneous
Employees of Renzo and employees' family members are ineligible to participate in this audit.
