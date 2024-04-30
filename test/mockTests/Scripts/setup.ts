import { ethers, upgrades } from 'hardhat';
import {
    OperatorDelegator,
    RenzoOracle,
    RestakeManager,
    RoleManager,
    EzEthToken,
    TestErc20,
    TestingStrategy,
    TestingStrategyManager,
    TestingDelegationManager,
    TestingEigenpodManager,
    DepositQueue,
    RewardHandler,
    XERC20Factory,
    XERC20,
} from '../../../typechain-types';
import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { IS_NATIVE, WITHDRAW_COOLDOWN } from './constants';
import { WithdrawQueueStorageV1 } from '../../../typechain-types/contracts/Withdraw/WithdrawQueue';

export function convertToBaseUnits(amount: number) {
    let exp = BigInt(10) ** BigInt(18);
    return BigInt(amount) * exp;
}

// Deploy Role Manager and give OWNER all admin roles
async function deployRoleManager() {
    const [OWNER] = await ethers.getSigners();

    // Deploy Role Manager
    const RoleManagerFactory = await ethers.getContractFactory('RoleManager');
    const deployedRoleManager = await upgrades.deployProxy(RoleManagerFactory, [OWNER.address]);

    // Doing this to get typescript type on the contract object
    const roleManager = RoleManagerFactory.attach(
        await deployedRoleManager.getAddress(),
    ) as RoleManager;

    // Grant the owner restake manager admin
    await roleManager.grantRole(await roleManager.RESTAKE_MANAGER_ADMIN(), OWNER.address);

    // Allow owner to set oracle addresses
    await roleManager.grantRole(await roleManager.OPERATOR_DELEGATOR_ADMIN(), OWNER.address);
    await roleManager.grantRole(await roleManager.ORACLE_ADMIN(), OWNER.address);
    await roleManager.grantRole(await roleManager.RESTAKE_MANAGER_ADMIN(), OWNER.address);

    return roleManager;
}

async function deployTokens(roleManager: RoleManager) {
    const TokenFactory = await ethers.getContractFactory('EzEthToken');
    const deployedToken = await upgrades.deployProxy(TokenFactory, [
        await roleManager.getAddress(),
    ]);

    // Doing this to get typescript type on the contract object
    const ezETH = TokenFactory.attach(await deployedToken.getAddress()) as EzEthToken;

    // Deploy a test token
    const stETH = await ethers.deployContract('TestErc20');
    await stETH.initialize('Staked ETH', 'stETH');

    const cbETH = await ethers.deployContract('TestErc20');
    await cbETH.initialize('Coinbase ETH', 'cbETH');
    return { ezETH, stETH, cbETH };
}

async function deployOracle(roleManager: RoleManager, stETH: TestErc20, cbETH: TestErc20) {
    // Deploy the Oracle
    const RenzoOracleFactory = await ethers.getContractFactory('RenzoOracle');
    const deployedRenzoOracle = await upgrades.deployProxy(RenzoOracleFactory, [
        await roleManager.getAddress(),
    ]);

    // Doing this to get typescript type on the contract object
    const renzoOracle = RenzoOracleFactory.attach(
        await deployedRenzoOracle.getAddress(),
    ) as RenzoOracle;

    // Create Test Oracles for stETH and cbETH
    const stEthPriceOracle = await ethers.deployContract('TestingOracle');
    const cbEthPriceOracle = await ethers.deployContract('TestingOracle');

    // Set the addresses in renzoOracle
    await renzoOracle.setOracleAddress(
        await stETH.getAddress(),
        await stEthPriceOracle.getAddress(),
    );
    await renzoOracle.setOracleAddress(
        await cbETH.getAddress(),
        await cbEthPriceOracle.getAddress(),
    );

    // Set the decimals on the test oracles
    let exp = BigInt(10) ** BigInt(18);

    // Set the prices on the test oracles
    // stETH will be set to 1 ETH
    await stEthPriceOracle.setLatestRoundData(
        100,
        BigInt(1) * exp, // Price with 18 decimals
        100,
        await time.latest(),
        100,
    );

    // Set the prices on the test oracles
    // cbETH will be set to 1.1 ETH
    await cbEthPriceOracle.setLatestRoundData(
        100,
        (BigInt(11) * exp) / BigInt(10), // Price with 18 decimals
        100,
        await time.latest(),
        100,
    );

    return { renzoOracle, stEthPriceOracle, cbEthPriceOracle };
}

async function deployStrategyManagers() {
    const strategyManager = await ethers.deployContract('TestingStrategyManager');
    const delegationManager = await ethers.deployContract('TestingDelegationManager');

    const stEthStrategy = await ethers.deployContract('TestingStrategy');
    const cbEthStrategy = await ethers.deployContract('TestingStrategy');

    return { strategyManager, stEthStrategy, cbEthStrategy, delegationManager };
}

async function deployRestakeManager(
    roleManager: RoleManager,
    ezETH: EzEthToken,
    renzoOracle: RenzoOracle,
    strategyManager: TestingStrategyManager,
    delegationManager: TestingDelegationManager,
) {
    // Deploy the DepositQueue
    const DepositQueueFactory = await ethers.getContractFactory('DepositQueue');
    const deployedDepositQueue = await upgrades.deployProxy(DepositQueueFactory, [
        await roleManager.getAddress(),
    ]);
    const depositQueue = DepositQueueFactory.attach(
        await deployedDepositQueue.getAddress(),
    ) as DepositQueue;

    const RestakeManagerFactory = await ethers.getContractFactory('RestakeManager');
    const deployedRestakeManager = await upgrades.deployProxy(RestakeManagerFactory, [
        await roleManager.getAddress(),
        await ezETH.getAddress(),
        await renzoOracle.getAddress(),
        await strategyManager.getAddress(),
        await delegationManager.getAddress(),
        await depositQueue.getAddress(),
    ]);

    // Deploy Withdraw Queue
    const WithdrawQueueFactory = await ethers.getContractFactory('WithdrawQueue');
    let tokenWithdrawBuffer: WithdrawQueueStorageV1.TokenWithdrawBufferStruct = {
        asset: IS_NATIVE,
        bufferAmount: 10_000,
    };
    const deployedWithdrawQueue = await upgrades.deployProxy(WithdrawQueueFactory, [
        await roleManager.getAddress(),
        await deployedRestakeManager.getAddress(),
        await ezETH.getAddress(),
        await renzoOracle.getAddress(),
        WITHDRAW_COOLDOWN,
        [tokenWithdrawBuffer],
    ]);

    // set withdraw queue to deposit queue
    await depositQueue.setWithdrawQueue(await deployedWithdrawQueue.getAddress());

    // Doing this to get typescript type on the contract object
    const restakeManager = RestakeManagerFactory.attach(
        await deployedRestakeManager.getAddress(),
    ) as RestakeManager;

    // Set the restake manager in the deposit queue
    await depositQueue.setRestakeManager(await restakeManager.getAddress());

    // Allow the restake manager to mint and burn ezETH tokens
    await roleManager.grantRole(
        await roleManager.RX_ETH_MINTER_BURNER(),
        await restakeManager.getAddress(),
    );

    // Deploy the RewardHandler
    const RewardHandlerFactory = await ethers.getContractFactory('RewardHandler');
    const deployedRewardHandler = await upgrades.deployProxy(RewardHandlerFactory, [
        await roleManager.getAddress(),
        await depositQueue.getAddress(),
    ]);
    const rewardHandler = RewardHandlerFactory.attach(
        await deployedRewardHandler.getAddress(),
    ) as RewardHandler;

    return {
        restakeManager,
        depositQueue,
        rewardHandler,
    };
}

async function deployOperatorDelegators(
    roleManager: RoleManager,
    strategyManager: TestingStrategyManager,
    restakeManager: RestakeManager,
    stETH: TestErc20,
    cbETH: TestErc20,
    stEthStrategy: TestingStrategy,
    cbEthStrategy: TestingStrategy,
    delegationManager: TestingDelegationManager,
    eigenPodManager: TestingEigenpodManager,
) {
    // Deploy the Operator Delegator
    const OperatorDelegatorFactory = await ethers.getContractFactory('OperatorDelegator');
    const deployedOperatorDelegator1 = await upgrades.deployProxy(OperatorDelegatorFactory, [
        await roleManager.getAddress(),
        await strategyManager.getAddress(),
        await restakeManager.getAddress(),
        await delegationManager.getAddress(),
        await eigenPodManager.getAddress(),
    ]);
    const deployedOperatorDelegator2 = await upgrades.deployProxy(OperatorDelegatorFactory, [
        await roleManager.getAddress(),
        await strategyManager.getAddress(),
        await restakeManager.getAddress(),
        await delegationManager.getAddress(),
        await eigenPodManager.getAddress(),
    ]);

    // Doing this to get typescript type on the contract object
    const operatorDelegator1 = OperatorDelegatorFactory.attach(
        await deployedOperatorDelegator1.getAddress(),
    ) as OperatorDelegator;
    const operatorDelegator2 = OperatorDelegatorFactory.attach(
        await deployedOperatorDelegator2.getAddress(),
    ) as OperatorDelegator;

    // Set the strategies for the tokens on the operator delegators
    await operatorDelegator1.setTokenStrategy(
        await stETH.getAddress(),
        await stEthStrategy.getAddress(),
    );
    await operatorDelegator1.setTokenStrategy(
        await cbETH.getAddress(),
        await cbEthStrategy.getAddress(),
    );

    await operatorDelegator2.setTokenStrategy(
        await stETH.getAddress(),
        await stEthStrategy.getAddress(),
    );
    await operatorDelegator2.setTokenStrategy(
        await cbETH.getAddress(),
        await cbEthStrategy.getAddress(),
    );

    return { operatorDelegator1, operatorDelegator2 };
}

async function deployWithdrawQueue() {}

export async function deploySystem() {
    // Contracts are deployed using the first signer/account by default
    const [OWNER, ALICE, BOB, CAROL] = await ethers.getSigners();

    // Deploy Role Manager
    const roleManager = await deployRoleManager();

    // Deploy Tokens
    const { ezETH, stETH, cbETH } = await deployTokens(roleManager);

    // Deploy the Oracle
    const { renzoOracle, stEthPriceOracle, cbEthPriceOracle } = await deployOracle(
        roleManager,
        stETH,
        cbETH,
    );

    // Deploy the Strategy Managers
    const { strategyManager, stEthStrategy, cbEthStrategy, delegationManager } =
        await deployStrategyManagers();

    // Deploy the RestakeManager
    const { restakeManager, depositQueue, rewardHandler } = await deployRestakeManager(
        roleManager,
        ezETH,
        renzoOracle,
        strategyManager,
        delegationManager,
    );

    // Deploy TestingEigenpodManager
    const eigenPodManager = await ethers.deployContract('TestingEigenpodManager', [
        strategyManager,
    ]);

    // Deploy OperatorDelegators
    const { operatorDelegator1, operatorDelegator2 } = await deployOperatorDelegators(
        roleManager,
        strategyManager,
        restakeManager,
        stETH,
        cbETH,
        stEthStrategy,
        cbEthStrategy,
        delegationManager,
        eigenPodManager,
    );

    // Add the operator delegators to the restake manager
    await restakeManager.addOperatorDelegator(
        await operatorDelegator1.getAddress(),
        7000, // 70% to operator 1
    );
    await restakeManager.addOperatorDelegator(
        await operatorDelegator2.getAddress(),
        3000, // 30% to operator 2
    );

    // Add the collateral tokens to the restake manager
    await restakeManager.addCollateralToken(await stETH.getAddress());
    await restakeManager.addCollateralToken(await cbETH.getAddress());

    return {
        strategyManager,
        depositQueue,
        delegationManager,
        eigenPodManager,
        restakeManager,
        roleManager,
        operatorDelegator1,
        operatorDelegator2,
        stEthStrategy,
        cbEthStrategy,
        ezETH,
        stETH,
        cbETH,
        renzoOracle,
        stEthPriceOracle,
        cbEthPriceOracle,
        OWNER,
        ALICE,
        BOB,
        CAROL,
        rewardHandler,
    };
}

export async function deployCustomSystem(nTokens: number, nOperators: number) {
    // Contracts are deployed using the first signer/account by default
    const [OWNER, ALICE, BOB, CAROL] = await ethers.getSigners();

    // Deploy Role Manager
    const roleManager = await deployRoleManager();

    const TokenFactory = await ethers.getContractFactory('EzEthToken');
    const deployedToken = await upgrades.deployProxy(TokenFactory, [
        await roleManager.getAddress(),
    ]);

    // Doing this to get typescript type on the contract object
    const ezETH = TokenFactory.attach(await deployedToken.getAddress()) as EzEthToken;

    // Deploy the Oracle
    const RenzoOracleFactory = await ethers.getContractFactory('RenzoOracle');
    const deployedRenzoOracle = await upgrades.deployProxy(RenzoOracleFactory, [
        await roleManager.getAddress(),
    ]);

    // Doing this to get typescript type on the contract object
    const renzoOracle = RenzoOracleFactory.attach(
        await deployedRenzoOracle.getAddress(),
    ) as RenzoOracle;

    const strategyManager = await ethers.deployContract('TestingStrategyManager');
    const delegationManager = await ethers.deployContract('TestingDelegationManager');

    // Deploy the RestakeManager
    const { restakeManager, depositQueue } = await deployRestakeManager(
        roleManager,
        ezETH,
        renzoOracle,
        strategyManager,
        delegationManager,
    );

    let tokens: Array<TestErc20> = [];
    let strategies: Array<TestingStrategy> = [];
    for (let index = 0; index < nTokens; index++) {
        const token = await ethers.deployContract('TestErc20');
        await token.initialize('Staked ETH ' + index, 'stETH' + index);
        tokens.push(token);

        const tokenOracle = await ethers.deployContract('TestingOracle');
        await renzoOracle.setOracleAddress(
            await token.getAddress(),
            await tokenOracle.getAddress(),
        );

        // Set the decimals on the test oracles
        let exp = BigInt(10) ** BigInt(18);

        // Set the prices on the test oracles
        // stETH will be set to 1 ETH
        await tokenOracle.setLatestRoundData(
            100,
            BigInt(1) * exp, // Price with 18 decimals
            100,
            await time.latest(),
            100,
        );

        const strategy = await ethers.deployContract('TestingStrategy');
        strategies.push(strategy);

        await restakeManager.addCollateralToken(await token.getAddress());
    }

    let operatorDelegators: Array<OperatorDelegator> = [];
    for (let index = 0; index < nOperators; index++) {
        // Deploy the Operator Delegator
        const OperatorDelegatorFactory = await ethers.getContractFactory('OperatorDelegator');
        const deployedOperatorDelegator = await upgrades.deployProxy(OperatorDelegatorFactory, [
            await roleManager.getAddress(),
            await strategyManager.getAddress(),
            await restakeManager.getAddress(),
            await delegationManager.getAddress(),
        ]);

        // Doing this to get typescript type on the contract object
        const operatorDelegator = OperatorDelegatorFactory.attach(
            await deployedOperatorDelegator.getAddress(),
        ) as OperatorDelegator;

        // Set the strategies for the tokens on the operator delegators
        for (let k = 0; k < tokens.length; k++) {
            await operatorDelegator.setTokenStrategy(
                await tokens[k].getAddress(),
                await strategies[k].getAddress(),
            );
        }

        await restakeManager.addOperatorDelegator(
            await operatorDelegator.getAddress(),
            10000, // temp allocation with get set below
        );

        let allocation = 10000;
        if (index == 0) {
            allocation = Math.ceil(10000 / nOperators);
        } else {
            allocation = Math.floor(10000 / nOperators);
        }
        await restakeManager.setOperatorDelegatorAllocation(
            await operatorDelegator.getAddress(),
            allocation, // 100% divided by nOperators
        );

        operatorDelegators.push(operatorDelegator);
    }

    return {
        delegationManager,
        restakeManager,
        roleManager,
        ezETH,
        renzoOracle,
        tokens,
        operatorDelegators,
        strategies,
        OWNER,
        ALICE,
        BOB,
        CAROL,
    };
}

export const deployXERC20Factory = async (proxyAdmin: string) => {
    // Deploy the token impl
    const TokenImpl = await ethers.deployContract('XERC20');
    const LockBoxImpl = await ethers.deployContract('XERC20Lockbox');

    // Deploy the xezETH Factory
    const xezETHFactoryFactory = await ethers.getContractFactory('XERC20Factory');
    const xezETHFactory = await upgrades.deployProxy(xezETHFactoryFactory, [
        await LockBoxImpl.getAddress(),
        await TokenImpl.getAddress(),
    ]);
    const deployedXezETHFactory = xezETHFactoryFactory.attach(
        await xezETHFactory.getAddress(),
    ) as XERC20Factory;

    // Deploy xezETH token
    const tokenDeployTx = await deployedXezETHFactory.deployXERC20(
        'xezETH',
        'xezETH',
        [],
        [],
        [],
        proxyAdmin,
    );
    const receipt = await tokenDeployTx.wait();

    // Get the deployed address from the event
    const event = receipt?.logs?.find(
        // @ts-ignore
        log => log.eventName === 'XERC20Deployed',
    );

    // @ts-ignore
    const deployedAddress = event?.args[0];

    const xERC20Factory = await ethers.getContractFactory('XERC20');
    const xezETH = xERC20Factory.attach(deployedAddress) as XERC20;

    return { xezETH, deployedXezETHFactory };
};