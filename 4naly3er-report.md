# Report


## Gas Optimizations


| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | Don't use `_msgSender()` if not supporting EIP-2771 | 1 |
| [GAS-2](#GAS-2) | `a = a + b` is more gas effective than `a += b` for state variables (excluding arrays and mappings) | 16 |
| [GAS-3](#GAS-3) | `array[index] += amount` is cheaper than `array[index] = array[index] + amount` (or related variants) | 1 |
| [GAS-4](#GAS-4) | Using bools for storage incurs overhead | 4 |
| [GAS-5](#GAS-5) | Cache array length outside of loop | 11 |
| [GAS-6](#GAS-6) | Use calldata instead of memory for function arguments that do not get mutated | 10 |
| [GAS-7](#GAS-7) | For Operations that will not overflow, you could use unchecked | 149 |
| [GAS-8](#GAS-8) | Use Custom Errors instead of Revert Strings to save Gas | 11 |
| [GAS-9](#GAS-9) | Avoid contract existence checks by using low level calls | 13 |
| [GAS-10](#GAS-10) | State variables only set in the constructor should be declared `immutable` | 1 |
| [GAS-11](#GAS-11) | Functions guaranteed to revert when called by normal users can be marked `payable` | 38 |
| [GAS-12](#GAS-12) | `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`) | 2 |
| [GAS-13](#GAS-13) | Using `private` rather than `public` for constants, saves gas | 22 |
| [GAS-14](#GAS-14) | Superfluous event fields | 1 |
| [GAS-15](#GAS-15) | Increments/decrements can be unchecked in for-loops | 7 |
| [GAS-16](#GAS-16) | Use != 0 instead of > 0 for unsigned integer comparison | 16 |
| [GAS-17](#GAS-17) | WETH address definition can be use directly | 1 |
### <a name="GAS-1"></a>[GAS-1] Don't use `_msgSender()` if not supporting EIP-2771
Use `msg.sender` if the code does not implement [EIP-2771 trusted forwarder](https://eips.ethereum.org/EIPS/eip-2771) support

*Instances (1)*:
```solidity
File: contracts/TimelockController.sol

129:             _checkRole(role, _msgSender());

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="GAS-2"></a>[GAS-2] `a = a + b` is more gas effective than `a += b` for state variables (excluding arrays and mappings)
This saves **16 gas per instance.**

*Instances (16)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

236:         bridgeFeeCollected += bridgeFee;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

232:             queuedShares[address(tokens[i])] += queuedWithdrawalParams[0].shares[i];

358:         stakedButNotVerifiedEth += msg.value;

472:         adminGasSpentInWei[msg.sender] += gasSpent;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

112:             totalValue += lookupTokenValue(_tokens[i], _balances[i]);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

313:                 operatorTVL += operatorValues[j];

317:                     totalWithdrawalQueueValue += renzoOracle.lookupTokenValue(

335:             operatorTVL += operatorEthBalance;

338:             totalTVL += operatorTVL;

352:         totalTVL += address(depositQueue).balance;

355:         totalTVL += (address(withdrawQueue).balance + totalWithdrawalQueueValue);

522:                 currentTokenTVL += operatorDelegatorTokenTVLs[i][tokenIndex];

679:         totalRewards += depositQueue.totalEarned(address(0x0));

688:             totalRewards += renzoOracle.lookupTokenValue(collateralTokens[i], tokenRewardAmount);

700:             totalRewards += address(operatorDelegators[i].eigenPod()).balance;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

253:         claimReserve[_assetOut] += amountToRedeem;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="GAS-3"></a>[GAS-3] `array[index] += amount` is cheaper than `array[index] = array[index] + amount` (or related variants)
When updating a value in an array with arithmetic, using `array[index] += amount` is cheaper than `array[index] = array[index] + amount`.

This is because you avoid an additional `mload` when the array is stored in memory, and an `sload` when the array is stored in storage.

This can be applied for any arithmetic operation including `+=`, `-=`,`/=`,`*=`,`^=`,`&=`, `%=`, `<<=`,`>>=`, and `>>>=`.

This optimization can be particularly significant if the pattern occurs during a loop.

*Saves 28 gas for a storage array, 38 for a memory array*

*Instances (1)*:
```solidity
File: contracts/Deposits/DepositQueue.sol

179:         totalEarned[address(0x0)] = totalEarned[address(0x0)] + remainingRewards;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

### <a name="GAS-4"></a>[GAS-4] Using bools for storage incurs overhead
Use uint256(1) and uint256(2) for true/false to avoid a Gwarmaccess (100 gas), and to avoid Gsset (20000 gas) when changing from ‘false’ to ‘true’, after having been ‘true’ in the past. See [source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/58f635312aa21f947cae5f8578638a85aa2519f5/contracts/security/ReentrancyGuard.sol#L23-L27).

*Instances (4)*:
```solidity
File: contracts/Bridge/L2/xRenzoDepositStorage.sol

44:     mapping(address => bool) public allowedBridgeSweepers;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDepositStorage.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

29:     bool public IS_NATIVE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/RestakeManagerStorage.sol

55:     bool public paused;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManagerStorage.sol)

```solidity
File: contracts/token/EzEthTokenStorage.sol

15:     bool public paused;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthTokenStorage.sol)

### <a name="GAS-5"></a>[GAS-5] Cache array length outside of loop
If not cached, the solidity compiler will always read the length of the array during each iteration. That is, if it is a storage array, this is an extra sload operation (100 additional extra gas for each iteration except for the first) and if it is a memory array, this is an extra mload operation (3 additional gas for each iteration except for the first).

*Instances (11)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

218:         for (uint256 i = 0; i < _destinationParam.length; ) {

264:         for (uint256 i = 0; i < _connextDestinationParam.length; ) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

209:         for (uint256 i; i < tokens.length; ) {

277:         for (uint256 i; i < tokens.length; ) {

381:         for (uint256 i = 0; i < validatorFields.length; ) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/TimelockController.sol

107:         for (uint256 i = 0; i < proposers.length; ++i) {

113:         for (uint256 i = 0; i < executors.length; ++i) {

272:         for (uint256 i = 0; i < targets.length; ++i) {

355:         for (uint256 i = 0; i < targets.length; ++i) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

88:         for (uint256 i = 0; i < _withdrawalBufferTarget.length; ) {

110:         for (uint256 i = 0; i < _newBufferTarget.length; ) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="GAS-6"></a>[GAS-6] Use calldata instead of memory for function arguments that do not get mutated
When a function with a `memory` array is called externally, the `abi.decode()` step has to use a for-loop to copy each index of the `calldata` to the `memory` index. Each iteration of this for-loop costs at least 60 gas (i.e. `60 * <mem_array>.length`). Using `calldata` directly bypasses this loop. 

If the array is passed to an `internal` function which passes the array to another internal function where the array is modified and therefore `memory` is used in the `external` call, it's still more gas-efficient to use `calldata` when the `external` function uses modifiers, since the modifiers may prevent the internal functions from being called. Structs have the same overhead as an array of length one. 

 *Saves 60 gas per instance*

*Instances (10)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

145:         bytes memory

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

75:         bytes memory _callData

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

119:         ISignatureUtils.SignatureWithExpiry memory approverSignatureAndExpiry,

447:         IERC20[] memory tokenList,

448:         uint256[] memory amountsToWithdraw,

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

104:         IERC20[] memory _tokens,

105:         uint256[] memory _balances

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

363:         uint256[] memory tvls,

403:         uint256[][] memory operatorDelegatorTokenTVLs,

404:         uint256[] memory operatorDelegatorTVLs,

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="GAS-7"></a>[GAS-7] For Operations that will not overflow, you could use unchecked

*Instances (149)*:
```solidity
File: contracts/Bridge/Connext/libraries/LibConnextStorage.sol

11:     None, // 0

12:     Reconciled, // 1

13:     Executed, // 2

14:     Completed // 3 - executed + reconciled

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/Connext/libraries/LibConnextStorage.sol)

```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

35:         bytes32 indexed messageId, // The unique ID of the CCIP message.

36:         uint64 indexed destinationChainSelector, // The chain selector of the destination chain.

37:         address receiver, // The address of the receiver on the destination chain.

38:         uint256 exchangeRate, // The exchange rate sent.

39:         address feeToken, // the token address used to pay CCIP fees.

40:         uint256 fees // The fees paid for sending the CCIP message.

44:         uint32 indexed destinationChainDomain, // The chain domain Id of the destination chain.

45:         address receiver, // The address of the receiver on the destination chain.

46:         uint256 exchangeRate, // The exchange rate sent.

47:         uint256 fees // The fees paid for sending the Connext message.

169:         uint256 ethAmount = address(this).balance - ethBalanceBeforeWithdraw;

178:         uint256 ezETHAmount = ezETH.balanceOf(address(this)) - ezETHBalanceBeforeDeposit;

190:         uint256 xezETHAmount = xezETH.balanceOf(address(this)) - xezETHBalanceBeforeDeposit;

220:                 receiver: abi.encode(_destinationParam[i]._renzoReceiver), // ABI-encoded xRenzoDepsot contract address

221:                 data: _callData, // ABI-encoded ezETH exchange rate with Timestamp

222:                 tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array indicating no tokens are being sent

259:                 ++i;

283:                 ++i;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

13:     uint256 public constant MAX_TIME_WINDOW = 86400 + 60; // 24 hours + 60 seconds

52:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

54:         uint256 _scaledPrice = (uint256(price)) * 10 ** (18 - oracle.decimals());

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

183:         uint256 wrappedAmount = depositToken.balanceOf(address(this)) - depositBalanceBefore;

235:         _amountIn -= bridgeFee;

236:         bridgeFeeCollected += bridgeFee;

248:         if (block.timestamp > _lastPriceTimestamp + 1 days) {

253:         uint256 xezETHAmount = (1e18 * amountOut) / _lastPrice;

280:             return (_amountIn * bridgeFeeShare) / FEE_BASIS;

282:             return (sweepBatchSize * bridgeFeeShare) / FEE_BASIS;

338:             (_price > lastPrice && (_price - lastPrice) > (lastPrice / 10)) ||

339:             (_price < lastPrice && (lastPrice - _price) > (lastPrice / 10))

386:             uint256 fee = (amountNextWETH * bridgeRouterFeeBps) / 10_000;

387:             amountNextWETH -= fee;

402:         feeCollected = address(this).balance - balanceBefore;

440:             0, // Asset is already nextWETH, so no slippage will be incurred

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

208:         bridges[_bridge].minterParams.currentLimit = _currentLimit - _change;

220:         bridges[_bridge].burnerParams.currentLimit = _currentLimit - _change;

241:         bridges[_bridge].minterParams.ratePerSecond = _limit / _DURATION;

263:         bridges[_bridge].burnerParams.ratePerSecond = _limit / _DURATION;

284:             _difference = _oldLimit - _limit;

285:             _newCurrentLimit = _currentLimit > _difference ? _currentLimit - _difference : 0;

287:             _difference = _limit - _oldLimit;

288:             _newCurrentLimit = _currentLimit + _difference;

311:         } else if (_timestamp + _DURATION <= block.timestamp) {

313:         } else if (_timestamp + _DURATION > block.timestamp) {

314:             uint256 _timePassed = block.timestamp - _timestamp;

315:             uint256 _calculatedLimit = _limit + (_timePassed * _ratePerSecond);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

167:         for (uint256 _i; _i < _bridgesLength; ++_i) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

109:         for (uint256 _i; _i < _bridgesLength; ++_i) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

176:         for (uint256 i = 0; i < strategyLength; i++) {

232:             queuedShares[address(tokens[i])] += queuedWithdrawalParams[0].shares[i];

234:                 ++i;

281:             queuedShares[address(tokens[i])] -= withdrawal.shares[i];

294:                     balanceOfToken -= bufferToFill;

312:                 ++i;

331:                 : tokenStrategyMapping[token].userUnderlyingView(address(this)) +

343:                 ? queuedShares[IS_NATIVE] + stakedButNotVerifiedEth - uint256(-podOwnerShares)

344:                 : queuedShares[IS_NATIVE] + stakedButNotVerifiedEth + uint256(podOwnerShares);

358:         stakedButNotVerifiedEth += msg.value;

385:             stakedButNotVerifiedEth -= (validatorCurrentBalanceGwei * GWEI_TO_WEI);

387:                 ++i;

471:         uint256 gasSpent = (initialGas - gasleft() + baseGasAmountSpent) * tx.gasprice;

472:         adminGasSpentInWei[msg.sender] += gasSpent;

489:         adminGasSpentInWei[tx.origin] -= gasRefund;

512:                 remainingAmount -= gasRefunded;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

167:             feeAmount = (msg.value * feeBasisPoints) / 10000;

174:         uint256 remainingRewards = msg.value - feeAmount;

179:         totalEarned[address(0x0)] = totalEarned[address(0x0)] + remainingRewards;

244:                 ++i;

261:                 feeAmount = (balance * feeBasisPoints) / 10000;

268:             token.approve(address(restakeManager), balance - feeAmount);

269:             restakeManager.depositTokenRewardsFromProtocol(token, balance - feeAmount);

272:             totalEarned[address(token)] = totalEarned[address(token)] + balance - feeAmount;

275:             emit RewardsDeposited(IERC20(address(token)), balance - feeAmount);

284:         uint256 gasUsed = (initialGas - gasleft()) * tx.gasprice;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

23:     uint256 constant SCALE_FACTOR = 10 ** 18;

26:     uint256 constant MAX_TIME_WINDOW = 86400 + 60; // 24 hours + 60 seconds

76:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

80:         return (uint256(price) * _balance) / SCALE_FACTOR;

93:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

97:         return (_value * SCALE_FACTOR) / uint256(price);

112:             totalValue += lookupTokenValue(_tokens[i], _balances[i]);

114:                 ++i;

131:             return _newValueAdded; // value is priced in base units, so divide by scale factor

135:         uint256 inflationPercentaage = (SCALE_FACTOR * _newValueAdded) /

136:             (_currentValueInProtocol + _newValueAdded);

139:         uint256 newEzETHSupply = (_existingEzETHSupply * SCALE_FACTOR) /

140:             (SCALE_FACTOR - inflationPercentaage);

143:         uint256 mintAmount = newEzETHSupply - _existingEzETHSupply;

158:         uint256 redeemAmount = (_currentValueInProtocol * _ezETHBeingBurned) / _existingEzETHSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

40:         return (10 ** 18 * totalTVL) / totalSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

141:                 ++i;

146:         if (_allocationBasisPoints > (100 * BASIS_POINTS)) revert OverMaxBasisPoints();

172:                 operatorDelegators[i] = operatorDelegators[operatorDelegators.length - 1];

178:                 ++i;

192:         if (_allocationBasisPoints > (100 * BASIS_POINTS)) revert OverMaxBasisPoints();

203:                 ++i;

226:                 ++i;

251:                 collateralTokens[i] = collateralTokens[collateralTokens.length - 1];

257:                 ++i;

294:             uint256[] memory operatorValues = new uint256[](collateralTokens.length + 1);

313:                 operatorTVL += operatorValues[j];

317:                     totalWithdrawalQueueValue += renzoOracle.lookupTokenValue(

324:                     ++j;

332:             operatorValues[operatorValues.length - 1] = operatorEthBalance;

335:             operatorTVL += operatorEthBalance;

338:             totalTVL += operatorTVL;

347:                 ++i;

352:         totalTVL += address(depositQueue).balance;

355:         totalTVL += (address(withdrawQueue).balance + totalWithdrawalQueueValue);

379:                 (operatorDelegatorAllocations[operatorDelegators[i]] * totalTVL) /

380:                     BASIS_POINTS /

387:                 ++i;

421:                 (operatorDelegatorAllocations[operatorDelegators[i]] * totalTVL) /

422:                     BASIS_POINTS /

430:                 ++i;

441:                 ++i;

460:                 ++i;

510:         if (maxDepositTVL != 0 && totalTVL + collateralTokenValue > maxDepositTVL) {

522:                 currentTokenTVL += operatorDelegatorTokenTVLs[i][tokenIndex];

524:                     ++i;

529:             if (currentTokenTVL + collateralTokenValue > collateralTokenTvlLimits[_collateralToken])

549:             _amount -= bufferToFill;

597:         if (maxDepositTVL != 0 && totalTVL + msg.value > maxDepositTVL) {

636:                 ++i;

679:         totalRewards += depositQueue.totalEarned(address(0x0));

688:             totalRewards += renzoOracle.lookupTokenValue(collateralTokens[i], tokenRewardAmount);

691:                 ++i;

700:             totalRewards += address(operatorDelegators[i].eigenPod()).balance;

702:                 ++i;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/TimelockController.sol

107:         for (uint256 i = 0; i < proposers.length; ++i) {

113:         for (uint256 i = 0; i < executors.length; ++i) {

272:         for (uint256 i = 0; i < targets.length; ++i) {

286:         _timestamps[id] = block.timestamp + delay;

355:         for (uint256 i = 0; i < targets.length; ++i) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

96:                 ++i;

119:                 ++i;

158:             return IERC20(_asset).balanceOf(address(this)) - claimReserve[_asset];

160:             return address(this).balance - claimReserve[_asset];

174:                 ? withdrawalBufferTarget[_asset] - availableToWithdraw

239:         withdrawRequestNonce++;

253:         claimReserve[_assetOut] += amountToRedeem;

261:             withdrawRequests[msg.sender].length - 1

287:         if (block.timestamp - _withdrawRequest.createdAt < coolDownPeriod) revert EarlyClaim();

290:         claimReserve[_withdrawRequest.collateralToken] -= _withdrawRequest.amountToRedeem;

294:             withdrawRequests[msg.sender].length - 1

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="GAS-8"></a>[GAS-8] Use Custom Errors instead of Revert Strings to save Gas
Custom errors are available from solidity version 0.8.4. Custom errors save [**~50 gas**](https://gist.github.com/IllIllI000/ad1bd0d29a0101b25e57c293b4b0c746) each time they're hit by [avoiding having to allocate and store the revert string](https://blog.soliditylang.org/2021/04/21/custom-errors/#errors-in-depth). Not defining the strings also save deployment gas

Additionally, custom errors can be used inside and outside of contracts (including interfaces and libraries).

Source: <https://blog.soliditylang.org/2021/04/21/custom-errors/>:

> Starting from [Solidity v0.8.4](https://github.com/ethereum/solidity/releases/tag/v0.8.4), there is a convenient and gas-efficient way to explain to users why an operation failed through the use of custom errors. Until now, you could already use strings to give more information about failures (e.g., `revert("Insufficient funds.");`), but they are rather expensive, especially when it comes to deploy cost, and it is difficult to use dynamic information in them.

Consider replacing **all revert strings** with custom errors in the solution, and particularly those that have multiple occurrences:

*Instances (11)*:
```solidity
File: contracts/TimelockController.sol

267:         require(targets.length == values.length, "TimelockController: length mismatch");

268:         require(targets.length == payloads.length, "TimelockController: length mismatch");

284:         require(!isOperation(id), "TimelockController: operation already scheduled");

285:         require(delay >= getMinDelay(), "TimelockController: insufficient delay");

297:         require(isOperationPending(id), "TimelockController: operation cannot be cancelled");

349:         require(targets.length == values.length, "TimelockController: length mismatch");

350:         require(targets.length == payloads.length, "TimelockController: length mismatch");

370:         require(success, "TimelockController: underlying transaction reverted");

377:         require(isOperationReady(id), "TimelockController: operation is not ready");

388:         require(isOperationReady(id), "TimelockController: operation is not ready");

403:         require(msg.sender == address(this), "TimelockController: caller must be timelock");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="GAS-9"></a>[GAS-9] Avoid contract existence checks by using low level calls
Prior to 0.8.10 the compiler inserted extra code, including `EXTCODESIZE` (**100 gas**), to check for contract existence for external function calls. In more recent solidity versions, the compiler will not insert these checks if the external call has a return value. Similar behavior can be achieved in earlier versions by using low-level calls, since low level calls never check for contract existence

*Instances (13)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

172:         uint256 ezETHBalanceBeforeDeposit = ezETH.balanceOf(address(this));

178:         uint256 ezETHAmount = ezETH.balanceOf(address(this)) - ezETHBalanceBeforeDeposit;

184:         uint256 xezETHBalanceBeforeDeposit = xezETH.balanceOf(address(this));

190:         uint256 xezETHAmount = xezETH.balanceOf(address(this)) - xezETHBalanceBeforeDeposit;

237:             if (fees > linkToken.balanceOf(address(this)))

238:                 revert NotEnoughBalance(linkToken.balanceOf(address(this)), fees);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

177:         uint256 depositBalanceBefore = depositToken.balanceOf(address(this));

183:         uint256 wrappedAmount = depositToken.balanceOf(address(this)) - depositBalanceBefore;

421:         uint256 balance = collateralToken.balanceOf(address(this));

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

289:                 uint256 balanceOfToken = tokens[i].balanceOf(address(this));

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

255:         uint256 balance = IERC20(token).balanceOf(address(this));

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/RestakeManager.sol

319:                         collateralTokens[j].balanceOf(withdrawQueue)

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

158:             return IERC20(_asset).balanceOf(address(this)) - claimReserve[_asset];

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="GAS-10"></a>[GAS-10] State variables only set in the constructor should be declared `immutable`
Variables only set in the constructor and never edited afterwards should be marked as immutable, as it would avoid the expensive storage-writing operation in the constructor (around **20 000 gas** per variable) and replace the expensive storage-reading operations (around **2100 gas** per reading) to a less expensive value reading (**3 gas**)

*Instances (1)*:
```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

57:         connext = _connext;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

### <a name="GAS-11"></a>[GAS-11] Functions guaranteed to revert when called by normal users can be marked `payable`
If a function modifier such as `onlyOwner` is used, the function will revert if a normal user tries to pay the function. Marking the function as `payable` will lower the gas cost for legitimate callers because the compiler will not include checks for whether a payment was provided.

*Instances (38)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

294:     function recoverNative(uint256 _amount, address _to) external onlyBridgeAdmin {

305:     function recoverERC20(address _token, uint256 _amount, address _to) external onlyBridgeAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

36:     function setOracleAddress(AggregatorV3Interface _oracleAddress) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

96:     function updateXRenzoBridgeL1(address _newXRenzoBridgeL1) external onlyOwner {

107:     function updateCCIPEthChainSelector(uint64 _newChainSelector) external onlyOwner {

117:     function unPause() external onlyOwner {

125:     function pause() external onlyOwner {

134:     function setRenzoDeposit(address _newXRenzoDeposit) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

92:     function updateXRenzoBridgeL1(address _newXRenzoBridgeL1) external onlyOwner {

103:     function updateCCIPEthChainSelector(uint32 _newChainDomain) external onlyOwner {

113:     function unPause() external onlyOwner {

121:     function pause() external onlyOwner {

130:     function setRenzoDeposit(address _newXRenzoDeposit) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

320:     function updatePriceByOwner(uint256 price) external onlyOwner {

466:     function setAllowedBridgeSweeper(address _sweeper, bool _allowed) external onlyOwner {

478:     function recoverNative(uint256 _amount, address _to) external onlyOwner {

489:     function recoverERC20(address _token, uint256 _amount, address _to) external onlyOwner {

501:     function setOraclePriceFeed(IRenzoOracleL2 _oracle) external onlyOwner {

511:     function setReceiverPriceFeed(address _receiver) external onlyOwner {

521:     function updateBridgeFeeShare(uint256 _newShare) external onlyOwner {

532:     function updateSweepBatchSize(uint256 _newBatchSize) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

101:     function activateRestaking() external nonReentrant onlyNativeEthRestakeAdmin {

459:     function startDelayedWithdrawUnstakedETH() external onlyNativeEthRestakeAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

87:     function setWithdrawQueue(IWithdrawQueue _withdrawQueue) external onlyRestakeManagerAdmin {

112:     function setRestakeManager(IRestakeManager _restakeManager) external onlyRestakeManagerAdmin {

254:     function sweepERC20(IERC20 token) external onlyERC20RewardsAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/RestakeManager.sol

121:     function setPaused(bool _paused) external onlyDepositWithdrawPauserAdmin {

215:     function setMaxDepositTVL(uint256 _maxDepositTVL) external onlyRestakeManagerAdmin {

220:     function addCollateralToken(IERC20 _newCollateralToken) external onlyRestakeManagerAdmin {

709:     function setTokenTvlLimit(IERC20 _token, uint256 _limit) external onlyRestakeManagerAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

58:     function forwardRewards() external nonReentrant onlyNativeEthRestakeAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/TimelockController.sol

296:     function cancel(bytes32 id) public virtual onlyRole(CANCELLER_ROLE) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

129:     function updateCoolDownPeriod(uint256 _newCoolDownPeriod) external onlyWithdrawQueueAdmin {

139:     function pause() external onlyWithdrawQueueAdmin {

147:     function unpause() external onlyWithdrawQueueAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthToken.sol

41:     function mint(address to, uint256 amount) external onlyMinterBurner {

46:     function burn(address from, uint256 amount) external onlyMinterBurner {

51:     function setPaused(bool _paused) external onlyTokenAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthToken.sol)

### <a name="GAS-12"></a>[GAS-12] `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`)
Pre-increments and pre-decrements are cheaper.

For a `uint256 i` variable, the following is true with the Optimizer enabled at 10k:

**Increment:**

- `i += 1` is the most expensive form
- `i++` costs 6 gas less than `i += 1`
- `++i` costs 5 gas less than `i++` (11 gas less than `i += 1`)

**Decrement:**

- `i -= 1` is the most expensive form
- `i--` costs 11 gas less than `i -= 1`
- `--i` costs 5 gas less than `i--` (16 gas less than `i -= 1`)

Note that post-increments (or post-decrements) return the old value before incrementing or decrementing, hence the name *post-increment*:

```solidity
uint i = 1;  
uint j = 2;
require(j == i++, "This will be false as i is incremented after the comparison");
```
  
However, pre-increments (or pre-decrements) return the new value:
  
```solidity
uint i = 1;  
uint j = 2;
require(j == ++i, "This will be true as i is incremented before the comparison");
```

In the pre-increment case, the compiler has to create a temporary variable (when used) for returning `1` instead of `2`.

Consider using pre-increments and pre-decrements where they are relevant (meaning: not where post-increments/decrements logic are relevant).

*Saves 5 gas per instance*

*Instances (2)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

176:         for (uint256 i = 0; i < strategyLength; i++) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

239:         withdrawRequestNonce++;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="GAS-13"></a>[GAS-13] Using `private` rather than `public` for constants, saves gas
If needed, the values can be read from the verified contract source code, or if there are multiple values there can be a single getter function that [returns a tuple](https://github.com/code-423n4/2022-08-frax/blob/90f55a9ce4e25bceed3a74290b854341d8de6afa/src/contracts/FraxlendPair.sol#L156-L178) of the values of all currently-public constants. Saves **3406-3606 gas** in deployment gas due to the compiler not having to create non-payable getter functions for deployment calldata, not having to store the bytes of the value outside of where it's used, and not adding another entry to the method ID table

*Instances (22)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

61:     uint8 public constant EXPECTED_DECIMALS = 18;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

13:     uint256 public constant MAX_TIME_WINDOW = 86400 + 60; // 24 hours + 60 seconds

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

37:     uint8 public constant EXPECTED_DECIMALS = 18;

40:     uint32 public constant FEE_BASIS = 10000;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

26:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

13:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Permissions/RoleManagerStorage.sol

11:     bytes32 public constant RX_ETH_MINTER_BURNER = keccak256("RX_ETH_MINTER_BURNER");

14:     bytes32 public constant OPERATOR_DELEGATOR_ADMIN = keccak256("OPERATOR_DELEGATOR_ADMIN");

17:     bytes32 public constant ORACLE_ADMIN = keccak256("ORACLE_ADMIN");

20:     bytes32 public constant RESTAKE_MANAGER_ADMIN = keccak256("RESTAKE_MANAGER_ADMIN");

23:     bytes32 public constant TOKEN_ADMIN = keccak256("TOKEN_ADMIN");

26:     bytes32 public constant NATIVE_ETH_RESTAKE_ADMIN = keccak256("NATIVE_ETH_RESTAKE_ADMIN");

29:     bytes32 public constant ERC20_REWARD_ADMIN = keccak256("ERC20_REWARD_ADMIN");

32:     bytes32 public constant DEPOSIT_WITHDRAW_PAUSER = keccak256("DEPOSIT_WITHDRAW_PAUSER");

39:     bytes32 public constant BRIDGE_ADMIN = keccak256("BRIDGE_ADMIN");

42:     bytes32 public constant PRICE_FEED_SENDER = keccak256("PRICE_FEED_SENDER");

47:     bytes32 public constant WITHDRAW_QUEUE_ADMIN = keccak256("WITHDRAW_QUEUE_ADMIN");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManagerStorage.sol)

```solidity
File: contracts/TimelockController.sol

26:     bytes32 public constant TIMELOCK_ADMIN_ROLE = keccak256("TIMELOCK_ADMIN_ROLE");

27:     bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

28:     bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

29:     bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

```solidity
File: contracts/Withdraw/WithdrawQueueStorage.sol

10:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueueStorage.sol)

### <a name="GAS-14"></a>[GAS-14] Superfluous event fields
`block.timestamp` and `block.number` are added to event information by default so adding them manually wastes gas

*Instances (1)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

42:     event PriceUpdated(uint256 price, uint256 timestamp);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

### <a name="GAS-15"></a>[GAS-15] Increments/decrements can be unchecked in for-loops
In Solidity 0.8+, there's a default overflow check on unsigned integers. It's possible to uncheck this in for-loops and save some gas at each iteration, but at the cost of some code readability, as this uncheck cannot be made inline.

[ethereum/solidity#10695](https://github.com/ethereum/solidity/issues/10695)

The change would be:

```diff
- for (uint256 i; i < numIterations; i++) {
+ for (uint256 i; i < numIterations;) {
 // ...  
+   unchecked { ++i; }
}  
```

These save around **25 gas saved** per instance.

The same can be applied with decrements (which should use `break` when `i == 0`).

The risk of overflow is non-existent for `uint256`.

*Instances (7)*:
```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

167:         for (uint256 _i; _i < _bridgesLength; ++_i) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

109:         for (uint256 _i; _i < _bridgesLength; ++_i) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

176:         for (uint256 i = 0; i < strategyLength; i++) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/TimelockController.sol

107:         for (uint256 i = 0; i < proposers.length; ++i) {

113:         for (uint256 i = 0; i < executors.length; ++i) {

272:         for (uint256 i = 0; i < targets.length; ++i) {

355:         for (uint256 i = 0; i < targets.length; ++i) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="GAS-16"></a>[GAS-16] Use != 0 instead of > 0 for unsigned integer comparison

*Instances (16)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

385:         if (bridgeRouterFeeBps > 0) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

290:                 if (bufferToFill > 0) {

307:                 if (balanceOfToken > 0) {

509:             if (adminGasSpentInWei[tx.origin] > 0) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

98:         if (_feeBasisPoints > 0) {

166:         if (feeAddress != address(0x0) && feeBasisPoints > 0) {

256:         if (balance > 0) {

260:             if (feeAddress != address(0x0) && feeBasisPoints > 0) {

298:         if (bufferToFill > 0) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/RestakeManager.sol

546:         if (bufferToFill > 0) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/TimelockController.sol

155:         return getTimestamp(id) > 0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="GAS-17"></a>[GAS-17] WETH address definition can be use directly
WETH is a wrap Ether contract with a specific address in the Ethereum network, giving the option to define it may cause false recognition, it is healthier to define it directly.

    Advantages of defining a specific contract directly:
    
    It saves gas,
    Prevents incorrect argument definition,
    Prevents execution on a different chain and re-signature issues,
    WETH Address : 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

*Instances (1)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridgeStorage.sol

29:     IERC20 public wETH;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridgeStorage.sol)


## Non Critical Issues


| |Issue|Instances|
|-|:-|:-:|
| [NC-1](#NC-1) | Array indices should be referenced via `enum`s rather than via numeric literals | 15 |
| [NC-2](#NC-2) | Use `string.concat()` or `bytes.concat()` instead of `abi.encodePacked` | 6 |
| [NC-3](#NC-3) | `constant`s should be defined rather than using magic numbers | 25 |
| [NC-4](#NC-4) | Control structures do not follow the Solidity Style Guide | 144 |
| [NC-5](#NC-5) | Default Visibility for constants | 4 |
| [NC-6](#NC-6) | Consider disabling `renounceOwnership()` | 3 |
| [NC-7](#NC-7) | Event is never emitted | 2 |
| [NC-8](#NC-8) | Event missing indexed field | 50 |
| [NC-9](#NC-9) | Events that mark critical parameter changes should contain both the old and the new value | 24 |
| [NC-10](#NC-10) | Function ordering does not follow the Solidity style guide | 14 |
| [NC-11](#NC-11) | Functions should not be longer than 50 lines | 131 |
| [NC-12](#NC-12) | Change int to int256 | 2 |
| [NC-13](#NC-13) | Change uint to uint256 | 2 |
| [NC-14](#NC-14) | Lack of checks in setters | 7 |
| [NC-15](#NC-15) | Missing Event for critical parameters change | 4 |
| [NC-16](#NC-16) | NatSpec is completely non-existent on functions that should have them | 5 |
| [NC-17](#NC-17) | Incomplete NatSpec: `@param` is missing on actually documented functions | 34 |
| [NC-18](#NC-18) | Incomplete NatSpec: `@return` is missing on actually documented functions | 1 |
| [NC-19](#NC-19) | Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor | 29 |
| [NC-20](#NC-20) | Constant state variables defined more than once | 7 |
| [NC-21](#NC-21) | Consider using named mappings | 15 |
| [NC-22](#NC-22) | `address`s shouldn't be hard-coded | 3 |
| [NC-23](#NC-23) | Owner can renounce while system is paused | 4 |
| [NC-24](#NC-24) | Adding a `return` statement when the function defines a named return variable, is redundant | 6 |
| [NC-25](#NC-25) | Take advantage of Custom Error's return value property | 150 |
| [NC-26](#NC-26) | Use scientific notation (e.g. `1e18`) rather than exponentiation (e.g. `10**18`) | 2 |
| [NC-27](#NC-27) | Contract does not follow the Solidity style guide's suggested layout ordering | 6 |
| [NC-28](#NC-28) | Use Underscores for Number Literals (add an underscore every 3 digits) | 6 |
| [NC-29](#NC-29) | Event is missing `indexed` fields | 56 |
| [NC-30](#NC-30) | Constants should be defined rather than using magic numbers | 4 |
| [NC-31](#NC-31) | `public` functions not called by the contract should be declared `external` instead | 17 |
| [NC-32](#NC-32) | Variables need not be initialized to zero | 37 |
### <a name="NC-1"></a>[NC-1] Array indices should be referenced via `enum`s rather than via numeric literals

*Instances (15)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

203:         queuedWithdrawalParams[0].strategies = new IStrategy[](tokens.length);

204:         queuedWithdrawalParams[0].shares = new uint256[](tokens.length);

212:                 queuedWithdrawalParams[0].strategies[i] = eigenPodManager.beaconChainETHStrategy();

215:                 queuedWithdrawalParams[0].shares[i] = tokenAmounts[i];

221:                 queuedWithdrawalParams[0].strategies[i] = tokenStrategyMapping[tokens[i]];

224:                 queuedWithdrawalParams[0].shares[i] = tokenStrategyMapping[tokens[i]]

229:             queuedWithdrawalParams[0].withdrawer = address(this);

232:             queuedShares[address(tokens[i])] += queuedWithdrawalParams[0].shares[i];

239:         bytes32 withdrawalRoot = delegationManager.queueWithdrawals(queuedWithdrawalParams)[0];

248:             queuedWithdrawalParams[0].strategies,

249:             queuedWithdrawalParams[0].shares

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/RestakeManager.sol

371:             return operatorDelegators[0];

392:         return operatorDelegators[0];

410:             if (operatorDelegatorTokenTVLs[0][tokenIndex] < ezETHValue) {

413:             return operatorDelegators[0];

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="NC-2"></a>[NC-2] Use `string.concat()` or `bytes.concat()` instead of `abi.encodePacked`
Solidity version 0.8.4 introduces `bytes.concat()` (vs `abi.encodePacked(<bytes>,<bytes>)`)

Solidity version 0.8.12 introduces `string.concat()` (vs `abi.encodePacked(<str>,<str>), which catches concatenation errors (in the event of a `bytes` data mixed in the concatenation)`)

*Instances (6)*:
```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

147:         bytes32 _salt = keccak256(abi.encodePacked(_name, _symbol, msg.sender));

158:         bytes memory _bytecode = abi.encodePacked(

190:         bytes32 _salt = keccak256(abi.encodePacked(_xerc20, _baseToken, msg.sender));

201:         bytes memory _bytecode = abi.encodePacked(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

89:         bytes32 _salt = keccak256(abi.encodePacked(_name, _symbol, msg.sender));

100:         bytes memory _bytecode = abi.encodePacked(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

### <a name="NC-3"></a>[NC-3] `constant`s should be defined rather than using magic numbers
Even [assembly](https://github.com/code-423n4/2022-05-opensea-seaport/blob/9d7ce4d08bf3c3010304a0476a785c70c0e90ae7/contracts/lib/TokenTransferrer.sol#L35-L39) can benefit from using readable constants instead of hex/numeric literals

*Instances (25)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

225:                     Client.EVMExtraArgsV1({ gasLimit: 200_000 })

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

30:         if (_oracle.decimals() > 18) revert InvalidTokenDecimals(18, _oracle.decimals());

39:         if (_oracleAddress.decimals() > 18)

54:         uint256 _scaledPrice = (uint256(price)) * 10 ** (18 - oracle.decimals());

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

140:         bridgeRouterFeeBps = 5;

152:         bridgeFeeShare = 5;

155:         sweepBatchSize = 32 ether;

338:             (_price > lastPrice && (_price - lastPrice) > (lastPrice / 10)) ||

339:             (_price < lastPrice && (lastPrice - _price) > (lastPrice / 10))

386:             uint256 fee = (amountNextWETH * bridgeRouterFeeBps) / 10_000;

522:         if (_newShare > 100) revert InvalidBridgeFeeShare(_newShare);

533:         if (_newBatchSize < 32 ether) revert InvalidSweepBatchSize(_newBatchSize);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

103:         if (_feeBasisPoints > 10000) revert OverMaxBasisPoints();

167:             feeAmount = (msg.value * feeBasisPoints) / 10000;

195:         restakeManager.stakeEthInOperatorDelegator{ value: 32 ether }(

202:         emit ETHStakedFromQueue(operatorDelegator, pubkey, 32 ether, address(this).balance);

229:             restakeManager.stakeEthInOperatorDelegator{ value: 32 ether }(

239:                 32 ether,

261:                 feeAmount = (balance * feeBasisPoints) / 10000;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

30:         return 18;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

30:         return 18;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

61:         if (_oracleAddress.decimals() != 18)

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

40:         return (10 ** 18 * totalTVL) / totalSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

231:         if (IERC20Metadata(address(_newCollateralToken)).decimals() != 18)

233:                 18,

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="NC-4"></a>[NC-4] Control structures do not follow the Solidity Style Guide
See the [control structures](https://docs.soliditylang.org/en/latest/style-guide.html#control-structures) section of the Solidity Style Guide

*Instances (144)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

51:         if (!roleManager.isBridgeAdmin(msg.sender)) revert NotBridgeAdmin();

56:         if (!roleManager.isPriceFeedSender(msg.sender)) revert NotPriceFeedSender();

83:         if (

237:             if (fees > linkToken.balanceOf(address(this)))

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

27:         if (address(_oracle) == address(0)) revert InvalidZeroInput();

30:         if (_oracle.decimals() > 18) revert InvalidTokenDecimals(18, _oracle.decimals());

37:         if (address(_oracleAddress) == address(0)) revert InvalidZeroInput();

39:         if (_oracleAddress.decimals() > 18)

52:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

55:         if (_scaledPrice < 1 ether) revert InvalidOraclePrice();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

48:         if (_xRenzoBridgeL1 == address(0) || _ccipEthChainSelector == 0) revert InvalidZeroInput();

72:         if (_ccipSender != xRenzoBridgeL1) revert InvalidSender(xRenzoBridgeL1, _ccipSender);

74:         if (_ccipSourceChainSelector != ccipEthChainSelector)

97:         if (_newXRenzoBridgeL1 == address(0)) revert InvalidZeroInput();

108:         if (_newChainSelector == 0) revert InvalidZeroInput();

135:         if (_newXRenzoDeposit == address(0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

44:         if (

53:         if (_xRenzoBridgeL1 == address(0) || _connextEthChainDomain == 0 || _connext == address(0))

93:         if (_newXRenzoBridgeL1 == address(0)) revert InvalidZeroInput();

104:         if (_newChainDomain == 0) revert InvalidZeroInput();

131:         if (_newXRenzoDeposit == address(0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

91:         if (

291:         if (receiver == address(0) && address(oracle) == address(0)) revert PriceFeedNotAvailable();

311:         if (msg.sender != receiver) revert InvalidSender(receiver, msg.sender);

337:         if (

404:         if (!success) revert TransferFailed();

522:         if (_newShare > 100) revert InvalidBridgeFeeShare(_newShare);

533:         if (_newBatchSize < 32 ether) revert InvalidSweepBatchSize(_newBatchSize);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

122:         if (msg.sender != FACTORY) revert IXERC20_NotFactory();

281:         uint256 _difference;

284:             _difference = _oldLimit - _limit;

285:             _newCurrentLimit = _currentLimit > _difference ? _currentLimit - _difference : 0;

287:             _difference = _limit - _oldLimit;

288:             _newCurrentLimit = _currentLimit + _difference;

330:         if (_amount == 0) revert IXERC20_INVALID_0_VALUE();

334:             if (_currentLimit < _amount) revert IXERC20_NotHighEnoughLimits();

350:         if (_amount == 0) revert IXERC20_INVALID_0_VALUE();

354:             if (_currentLimit < _amount) revert IXERC20_NotHighEnoughLimits();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

115:         if (XERC20(_xerc20).owner() != msg.sender) revert IXERC20Factory_NotOwner();

116:         if (_lockboxRegistry[_xerc20] != address(0)) revert IXERC20Factory_LockboxAlreadyDeployed();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

55:         if (!IS_NATIVE) revert IXERC20Lockbox_NotNative();

67:         if (IS_NATIVE) revert IXERC20Lockbox_Native();

80:         if (IS_NATIVE) revert IXERC20Lockbox_Native();

92:         if (!IS_NATIVE) revert IXERC20Lockbox_NotNative();

132:             if (!_success) revert IXERC20Lockbox_WithdrawFailed();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

51:         if (!roleManager.isOperatorDelegatorAdmin(msg.sender)) revert NotOperatorDelegatorAdmin();

57:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

63:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

81:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

82:         if (address(_strategyManager) == address(0x0)) revert InvalidZeroInput();

83:         if (address(_restakeManager) == address(0x0)) revert InvalidZeroInput();

84:         if (address(_delegationManager) == address(0x0)) revert InvalidZeroInput();

85:         if (address(_eigenPodManager) == address(0x0)) revert InvalidZeroInput();

110:         if (address(_token) == address(0x0)) revert InvalidZeroInput();

122:         if (address(_delegateAddress) == address(0x0)) revert InvalidZeroInput();

123:         if (address(delegateAddress) != address(0x0)) revert DelegateAddressAlreadySet();

135:         if (_baseGasAmountSpent == 0) revert InvalidZeroInput();

147:         if (address(tokenStrategyMapping[token]) == address(0x0) || tokenAmount == 0)

199:         if (tokens.length != tokenAmounts.length) revert MismatchedArrayLengths();

217:                 if (address(tokenStrategyMapping[tokens[i]]) == address(0))

271:         if (tokens.length != withdrawal.strategies.length) revert MismatchedArrayLengths();

278:             if (address(tokens[i]) == address(0)) revert InvalidZeroInput();

343:                 ? queuedShares[IS_NATIVE] + stakedButNotVerifiedEth - uint256(-podOwnerShares)

344:                 : queuedShares[IS_NATIVE] + stakedButNotVerifiedEth + uint256(podOwnerShares);

358:         stakedButNotVerifiedEth += msg.value;

364:     function verifyWithdrawalCredentials(

372:         eigenPod.verifyWithdrawalCredentials(

385:             stakedButNotVerifiedEth -= (validatorCurrentBalanceGwei * GWEI_TO_WEI);

405:     function verifyAndProcessWithdrawals(

414:         eigenPod.verifyAndProcessWithdrawals(

486:         if (!success) revert TransferFailed();

521:             if (!success) revert TransferFailed();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Delegation/OperatorDelegatorStorage.sol

43:     uint256 public stakedButNotVerifiedEth;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegatorStorage.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

45:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

51:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

57:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

63:         if (!roleManager.isERC20RewardsAdmin(msg.sender)) revert NotERC20RewardsAdmin();

77:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

88:         if (address(_withdrawQueue) == address(0)) revert InvalidZeroInput();

99:             if (_feeAddress == address(0x0)) revert InvalidZeroInput();

103:         if (_feeBasisPoints > 10000) revert OverMaxBasisPoints();

113:         if (address(_restakeManager) == address(0x0)) revert InvalidZeroInput();

138:         if (_amount == 0 || _asset == address(0)) revert InvalidZeroInput();

169:             if (!success) revert TransferFailed();

219:         if (

287:         if (!success) revert TransferFailed();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

24:         if (address(_wBETHToken) == address(0x0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

24:         if (address(_methStaking) == address(0x0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

30:         if (!roleManager.isOracleAdmin(msg.sender)) revert NotOracleAdmin();

45:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

58:         if (address(_token) == address(0x0)) revert InvalidZeroInput();

61:         if (_oracleAddress.decimals() != 18)

73:         if (address(oracle) == address(0x0)) revert OracleNotFound();

76:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

77:         if (price <= 0) revert InvalidOraclePrice();

90:         if (address(oracle) == address(0x0)) revert OracleNotFound();

93:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

94:         if (price <= 0) revert InvalidOraclePrice();

107:         if (_tokens.length != _balances.length) revert MismatchedArrayLengths();

146:         if (mintAmount == 0) revert InvalidTokenAmount();

161:         if (redeemAmount == 0) revert InvalidTokenAmount();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

23:         if (address(roleManagerAdmin) == address(0x0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

21:         if (address(_restakeManager) == address(0x0)) revert InvalidZeroInput();

22:         if (address(_ezETHToken) == address(0x0)) revert InvalidZeroInput();

37:         if (totalSupply == 0 || totalTVL == 0) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

72:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

78:         if (!roleManager.isDepositWithdrawPauser(msg.sender)) revert NotDepositWithdrawPauser();

84:         if (msg.sender != address(depositQueue)) revert NotDepositQueue();

90:         if (paused) revert ContractPaused();

138:             if (address(operatorDelegators[i]) == address(_newOperatorDelegator))

146:         if (_allocationBasisPoints > (100 * BASIS_POINTS)) revert OverMaxBasisPoints();

191:         if (address(_operatorDelegator) == address(0x0)) revert InvalidZeroInput();

192:         if (_allocationBasisPoints > (100 * BASIS_POINTS)) revert OverMaxBasisPoints();

206:         if (!foundOd) revert NotFound();

224:             if (address(collateralTokens[i]) == address(_newCollateralToken)) revert AlreadyAdded();

231:         if (IERC20Metadata(address(_newCollateralToken)).decimals() != 18)

367:         if (operatorDelegators.length == 0) revert NotFound();

377:             if (

419:             if (

529:             if (currentTokenTVL + collateralTokenValue > collateralTokenTvlLimits[_collateralToken])

639:         if (!found) revert NotFound();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

19:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

25:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

41:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

42:         if (address(_rewardDestination) == address(0x0)) revert InvalidZeroInput();

69:         if (!success) revert TransferFailed();

75:         if (address(_rewardDestination) == address(0x0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

40:         if (!roleManager.isWithdrawQueueAdmin(msg.sender)) revert NotWithdrawQueueAdmin();

46:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

51:         if (msg.sender != address(restakeManager.depositQueue())) revert NotDepositQueue();

72:         if (

89:             if (

109:         if (_newBufferTarget.length == 0) revert InvalidZeroInput();

111:             if (_newBufferTarget[i].asset == address(0) || _newBufferTarget[i].bufferAmount == 0)

130:         if (_newCoolDownPeriod == 0) revert InvalidZeroInput();

196:         if (_asset == address(0) || _amount == 0) revert InvalidZeroInput();

208:         if (_amount == 0 || _assetOut == address(0)) revert InvalidZeroInput();

211:         if (withdrawalBufferTarget[_assetOut] == 0) revert UnsupportedWithdrawAsset();

236:         if (amountToRedeem > getAvailableToWithdraw(_assetOut)) revert NotEnoughWithdrawBuffer();

281:         if (withdrawRequestIndex >= withdrawRequests[msg.sender].length)

287:         if (block.timestamp - _withdrawRequest.createdAt < coolDownPeriod) revert EarlyClaim();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthToken.sol

16:         if (!roleManager.isEzETHMinterBurner(msg.sender)) revert NotEzETHMinterBurner();

22:         if (!roleManager.isTokenAdmin(msg.sender)) revert NotTokenAdmin();

34:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthToken.sol)

### <a name="NC-5"></a>[NC-5] Default Visibility for constants
Some constants are using the default visibility. For readability, consider explicitly declaring them as `internal`.

*Instances (4)*:
```solidity
File: contracts/Oracle/RenzoOracle.sol

20:     string constant INVALID_0_INPUT = "Invalid 0 input";

23:     uint256 constant SCALE_FACTOR = 10 ** 18;

26:     uint256 constant MAX_TIME_WINDOW = 86400 + 60; // 24 hours + 60 seconds

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

38:     uint256 constant BASIS_POINTS = 100;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="NC-6"></a>[NC-6] Consider disabling `renounceOwnership()`
If the plan for your project does not include eventually giving up all ownership control, consider overwriting OpenZeppelin's `Ownable`'s `renounceOwnership()` function in order to disable it.

*Instances (3)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

11: contract RenzoOracleL2 is Initializable, OwnableUpgradeable, RenzoOracleL2StorageV1 {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

14: contract Receiver is CCIPReceiver, Ownable, Pausable {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

10: contract ConnextReceiver is IXReceiver, Ownable, Pausable {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

### <a name="NC-7"></a>[NC-7] Event is never emitted
The following are defined but never emitted. They can be removed to make the code cleaner.

*Instances (2)*:
```solidity
File: contracts/RestakeManager.sol

50:     event UserWithdrawStarted(

59:     event UserWithdrawCompleted(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="NC-8"></a>[NC-8] Event missing indexed field
Index event fields make the field more quickly accessible [to off-chain tools](https://ethereum.stackexchange.com/questions/40396/can-somebody-please-explain-the-concept-of-event-indexing) that parse events. This is especially useful when it comes to filtering based on an address. However, note that each index field costs extra gas during emission, so it's not necessarily best to index the maximum allowed per event (three fields). Where applicable, each `event` should use three `indexed` fields if there are three or more fields, and gas usage is not particularly of concern for the events in question. If there are fewer than three applicable fields, all of the applicable fields should be indexed.

*Instances (50)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

25:     event EzETHMinted(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

15:     event OracleAddressUpdated(address newOracle, address oldOracle);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

24:     event XRenzoBridgeL1Updated(address newBridgeAddress, address oldBridgeAddress);

25:     event CCIPEthChainSelectorUpdated(uint64 newSourceChainSelector, uint64 oldSourceChainSelector);

26:     event XRenzoDepositUpdated(address newRenzoDeposit, address oldRenzoDeposit);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

23:     event XRenzoBridgeL1Updated(address newBridgeAddress, address oldBridgeAddress);

24:     event ConnextEthChainDomainUpdated(uint32 newSourceChainDomain, uint32 oldSourceChainDomain);

25:     event XRenzoDepositUpdated(address newRenzoDeposit, address oldRenzoDeposit);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

42:     event PriceUpdated(uint256 price, uint256 timestamp);

44:     event BridgeSweeperAddressUpdated(address sweeper, bool allowed);

45:     event BridgeSwept(

51:     event OraclePriceFeedUpdated(address newOracle, address oldOracle);

52:     event ReceiverPriceFeedUpdated(address newReceiver, address oldReceiver);

53:     event SweeperBridgeFeeCollected(address sweeper, uint256 feeCollected);

54:     event BridgeFeeShareUpdated(uint256 oldBridgeFeeShare, uint256 newBridgeFeeShare);

55:     event SweepBatchSizeUpdated(uint256 oldSweepBatchSize, uint256 newSweepBatchSize);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

28:     event TokenStrategyUpdated(IERC20 token, IStrategy strategy);

29:     event DelegationAddressUpdated(address delegateAddress);

30:     event RewardsForwarded(address rewardDestination, uint256 amount);

32:     event WithdrawStarted(

43:     event WithdrawCompleted(bytes32 withdrawalRoot, IStrategy[] strategies, uint256[] shares);

45:     event GasSpent(address admin, uint256 gasSpent);

46:     event GasRefunded(address admin, uint256 gasRefunded);

47:     event BaseGasAmountSpentUpdated(uint256 oldBaseGasAmountSpent, uint256 newBaseGasAmountSpent);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

15:     event RewardsDeposited(IERC20 token, uint256 amount);

17:     event FeeConfigUpdated(address feeAddress, uint256 feeBasisPoints);

19:     event RestakeManagerUpdated(IRestakeManager restakeManager);

21:     event ETHDepositedFromProtocol(uint256 amount);

23:     event ETHStakedFromQueue(

30:     event ProtocolFeesPaid(IERC20 token, uint256 amount, address destination);

32:     event GasRefunded(address admin, uint256 gasRefunded);

35:     event WithdrawQueueUpdated(address oldWithdrawQueue, address newWithdrawQueue);

38:     event BufferFilled(address token, uint256 amount);

41:     event FullWithdrawalETHReceived(uint256 amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

35:     event OracleAddressUpdated(IERC20 token, AggregatorV3Interface oracleAddress);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

30:     event OperatorDelegatorAdded(IOperatorDelegator od);

31:     event OperatorDelegatorRemoved(IOperatorDelegator od);

32:     event OperatorDelegatorAllocationUpdated(IOperatorDelegator od, uint256 allocation);

34:     event CollateralTokenAdded(IERC20 token);

35:     event CollateralTokenRemoved(IERC20 token);

41:     event Deposit(

50:     event UserWithdrawStarted(

59:     event UserWithdrawCompleted(

68:     event CollateralTokenTvlUpdated(IERC20 token, uint256 tvl);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

29:     event RewardDestinationUpdated(address rewardDestination);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

19:     event WithdrawBufferTargetUpdated(uint256 oldBufferTarget, uint256 newBufferTarget);

21:     event CoolDownPeriodUpdated(uint256 oldCoolDownPeriod, uint256 newCoolDownPeriod);

23:     event EthBufferFilled(uint256 amount);

25:     event ERC20BufferFilled(address asset, uint256 amount);

36:     event WithdrawRequestClaimed(WithdrawRequest withdrawRequest);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="NC-9"></a>[NC-9] Events that mark critical parameter changes should contain both the old and the new value
This should especially be done if the new value is not required to be different from the old value

*Instances (24)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

36:     function setOracleAddress(AggregatorV3Interface _oracleAddress) external onlyOwner {
            if (address(_oracleAddress) == address(0)) revert InvalidZeroInput();
            // Verify that the pricing of the oracle is less than or equal to 18 decimals - pricing calculations will be off otherwise
            if (_oracleAddress.decimals() > 18)
                revert InvalidTokenDecimals(18, _oracleAddress.decimals());
    
            emit OracleAddressUpdated(address(_oracleAddress), address(oracle));

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

96:     function updateXRenzoBridgeL1(address _newXRenzoBridgeL1) external onlyOwner {
            if (_newXRenzoBridgeL1 == address(0)) revert InvalidZeroInput();
            emit XRenzoBridgeL1Updated(_newXRenzoBridgeL1, xRenzoBridgeL1);

107:     function updateCCIPEthChainSelector(uint64 _newChainSelector) external onlyOwner {
             if (_newChainSelector == 0) revert InvalidZeroInput();
             emit CCIPEthChainSelectorUpdated(_newChainSelector, ccipEthChainSelector);

134:     function setRenzoDeposit(address _newXRenzoDeposit) external onlyOwner {
             if (_newXRenzoDeposit == address(0)) revert InvalidZeroInput();
             emit XRenzoDepositUpdated(_newXRenzoDeposit, address(xRenzoDeposit));

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

92:     function updateXRenzoBridgeL1(address _newXRenzoBridgeL1) external onlyOwner {
            if (_newXRenzoBridgeL1 == address(0)) revert InvalidZeroInput();
            emit XRenzoBridgeL1Updated(_newXRenzoBridgeL1, xRenzoBridgeL1);

103:     function updateCCIPEthChainSelector(uint32 _newChainDomain) external onlyOwner {
             if (_newChainDomain == 0) revert InvalidZeroInput();
             emit ConnextEthChainDomainUpdated(_newChainDomain, connextEthChainDomain);

130:     function setRenzoDeposit(address _newXRenzoDeposit) external onlyOwner {
             if (_newXRenzoDeposit == address(0)) revert InvalidZeroInput();
             emit XRenzoDepositUpdated(_newXRenzoDeposit, address(xRenzoDeposit));

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

466:     function setAllowedBridgeSweeper(address _sweeper, bool _allowed) external onlyOwner {
             allowedBridgeSweepers[_sweeper] = _allowed;
     
             emit BridgeSweeperAddressUpdated(_sweeper, _allowed);

501:     function setOraclePriceFeed(IRenzoOracleL2 _oracle) external onlyOwner {
             emit OraclePriceFeedUpdated(address(_oracle), address(oracle));

511:     function setReceiverPriceFeed(address _receiver) external onlyOwner {
             emit ReceiverPriceFeedUpdated(_receiver, receiver);

521:     function updateBridgeFeeShare(uint256 _newShare) external onlyOwner {
             if (_newShare > 100) revert InvalidBridgeFeeShare(_newShare);
             emit BridgeFeeShareUpdated(bridgeFeeShare, _newShare);

532:     function updateSweepBatchSize(uint256 _newBatchSize) external onlyOwner {
             if (_newBatchSize < 32 ether) revert InvalidSweepBatchSize(_newBatchSize);
             emit SweepBatchSizeUpdated(sweepBatchSize, _newBatchSize);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

106:     function setTokenStrategy(
             IERC20 _token,
             IStrategy _strategy
         ) external nonReentrant onlyOperatorDelegatorAdmin {
             if (address(_token) == address(0x0)) revert InvalidZeroInput();
     
             tokenStrategyMapping[_token] = _strategy;
             emit TokenStrategyUpdated(_token, _strategy);

117:     function setDelegateAddress(
             address _delegateAddress,
             ISignatureUtils.SignatureWithExpiry memory approverSignatureAndExpiry,
             bytes32 approverSalt
         ) external nonReentrant onlyOperatorDelegatorAdmin {
             if (address(_delegateAddress) == address(0x0)) revert InvalidZeroInput();
             if (address(delegateAddress) != address(0x0)) revert DelegateAddressAlreadySet();
     
             delegateAddress = _delegateAddress;
     
             delegationManager.delegateTo(delegateAddress, approverSignatureAndExpiry, approverSalt);
     
             emit DelegationAddressUpdated(_delegateAddress);

132:     function setBaseGasAmountSpent(
             uint256 _baseGasAmountSpent
         ) external nonReentrant onlyOperatorDelegatorAdmin {
             if (_baseGasAmountSpent == 0) revert InvalidZeroInput();
             emit BaseGasAmountSpentUpdated(baseGasAmountSpent, _baseGasAmountSpent);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

87:     function setWithdrawQueue(IWithdrawQueue _withdrawQueue) external onlyRestakeManagerAdmin {
            if (address(_withdrawQueue) == address(0)) revert InvalidZeroInput();
            emit WithdrawQueueUpdated(address(withdrawQueue), address(_withdrawQueue));

93:     function setFeeConfig(
            address _feeAddress,
            uint256 _feeBasisPoints
        ) external onlyRestakeManagerAdmin {
            // Verify address is set if basis points are non-zero
            if (_feeBasisPoints > 0) {
                if (_feeAddress == address(0x0)) revert InvalidZeroInput();
            }
    
            // Verify basis points are not over 100%
            if (_feeBasisPoints > 10000) revert OverMaxBasisPoints();
    
            feeAddress = _feeAddress;
            feeBasisPoints = _feeBasisPoints;
    
            emit FeeConfigUpdated(_feeAddress, _feeBasisPoints);

112:     function setRestakeManager(IRestakeManager _restakeManager) external onlyRestakeManagerAdmin {
             if (address(_restakeManager) == address(0x0)) revert InvalidZeroInput();
     
             restakeManager = _restakeManager;
     
             emit RestakeManagerUpdated(_restakeManager);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

54:     function setOracleAddress(
            IERC20 _token,
            AggregatorV3Interface _oracleAddress
        ) external nonReentrant onlyOracleAdmin {
            if (address(_token) == address(0x0)) revert InvalidZeroInput();
    
            // Verify that the pricing of the oracle is 18 decimals - pricing calculations will be off otherwise
            if (_oracleAddress.decimals() != 18)
                revert InvalidTokenDecimals(18, _oracleAddress.decimals());
    
            tokenOracleLookup[_token] = _oracleAddress;
            emit OracleAddressUpdated(_token, _oracleAddress);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

187:     function setOperatorDelegatorAllocation(
             IOperatorDelegator _operatorDelegator,
             uint256 _allocationBasisPoints
         ) external onlyRestakeManagerAdmin {
             if (address(_operatorDelegator) == address(0x0)) revert InvalidZeroInput();
             if (_allocationBasisPoints > (100 * BASIS_POINTS)) revert OverMaxBasisPoints();
     
             // Ensure the OD is in the list to prevent mis-configuration
             bool foundOd = false;
             uint256 odLength = operatorDelegators.length;
             for (uint256 i = 0; i < odLength; ) {
                 if (address(operatorDelegators[i]) == address(_operatorDelegator)) {
                     foundOd = true;
                     break;
                 }
                 unchecked {
                     ++i;
                 }
             }
             if (!foundOd) revert NotFound();
     
             // Set the allocation
             operatorDelegatorAllocations[_operatorDelegator] = _allocationBasisPoints;
     
             emit OperatorDelegatorAllocationUpdated(_operatorDelegator, _allocationBasisPoints);

709:     function setTokenTvlLimit(IERC20 _token, uint256 _limit) external onlyRestakeManagerAdmin {
             // Verify collateral token is in the list - call will revert if not found
             getCollateralTokenIndex(_token);
     
             // Set the limit
             collateralTokenTvlLimits[_token] = _limit;
     
             emit CollateralTokenTvlUpdated(_token, _limit);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

72:     function setRewardDestination(
            address _rewardDestination
        ) external nonReentrant onlyRestakeManagerAdmin {
            if (address(_rewardDestination) == address(0x0)) revert InvalidZeroInput();
    
            rewardDestination = _rewardDestination;
    
            emit RewardDestinationUpdated(_rewardDestination);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

106:     function updateWithdrawBufferTarget(
             TokenWithdrawBuffer[] calldata _newBufferTarget
         ) external onlyWithdrawQueueAdmin {
             if (_newBufferTarget.length == 0) revert InvalidZeroInput();
             for (uint256 i = 0; i < _newBufferTarget.length; ) {
                 if (_newBufferTarget[i].asset == address(0) || _newBufferTarget[i].bufferAmount == 0)
                     revert InvalidZeroInput();
                 emit WithdrawBufferTargetUpdated(

129:     function updateCoolDownPeriod(uint256 _newCoolDownPeriod) external onlyWithdrawQueueAdmin {
             if (_newCoolDownPeriod == 0) revert InvalidZeroInput();
             emit CoolDownPeriodUpdated(coolDownPeriod, _newCoolDownPeriod);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="NC-10"></a>[NC-10] Function ordering does not follow the Solidity style guide
According to the [Solidity style guide](https://docs.soliditylang.org/en/v0.8.17/style-guide.html#order-of-functions), functions should be laid out in the following order :`constructor()`, `receive()`, `fallback()`, `external`, `public`, `internal`, `private`, but the cases below do not follow this pattern

*Instances (14)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

1: 
   Current order:
   public initialize
   external xReceive
   external sendPrice
   external recoverNative
   external recoverERC20
   
   Suggested order:
   external xReceive
   external sendPrice
   external recoverNative
   external recoverERC20
   public initialize

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

1: 
   Current order:
   public initialize
   external setOracleAddress
   public getMintRate
   
   Suggested order:
   external setOracleAddress
   public initialize
   public getMintRate

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

1: 
   Current order:
   internal _ccipReceive
   external updateXRenzoBridgeL1
   external updateCCIPEthChainSelector
   external unPause
   external pause
   external setRenzoDeposit
   
   Suggested order:
   external updateXRenzoBridgeL1
   external updateCCIPEthChainSelector
   external unPause
   external pause
   external setRenzoDeposit
   internal _ccipReceive

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

1: 
   Current order:
   public initialize
   external depositETH
   external deposit
   internal _deposit
   public getBridgeFeeShare
   public getMintRate
   external updatePrice
   external updatePriceByOwner
   internal _updatePrice
   internal _trade
   internal _recoverBridgeFee
   public sweep
   external getRate
   external setAllowedBridgeSweeper
   external recoverNative
   external recoverERC20
   external setOraclePriceFeed
   external setReceiverPriceFeed
   external updateBridgeFeeShare
   external updateSweepBatchSize
   
   Suggested order:
   external depositETH
   external deposit
   external updatePrice
   external updatePriceByOwner
   external getRate
   external setAllowedBridgeSweeper
   external recoverNative
   external recoverERC20
   external setOraclePriceFeed
   external setReceiverPriceFeed
   external updateBridgeFeeShare
   external updateSweepBatchSize
   public initialize
   public getBridgeFeeShare
   public getMintRate
   public sweep
   internal _deposit
   internal _updatePrice
   internal _trade
   internal _recoverBridgeFee

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

1: 
   Current order:
   external initialize
   external activateRestaking
   external setTokenStrategy
   external setDelegateAddress
   external setBaseGasAmountSpent
   external deposit
   internal _deposit
   public getStrategyIndex
   external queueWithdrawals
   external completeQueuedWithdrawal
   external getTokenBalanceFromStrategy
   external getStakedETHBalance
   external stakeEth
   external verifyWithdrawalCredentials
   external verifyAndProcessWithdrawals
   external withdrawNonBeaconChainETHBalanceWei
   external recoverTokens
   external startDelayedWithdrawUnstakedETH
   internal _recordGas
   internal _refundGas
   
   Suggested order:
   external initialize
   external activateRestaking
   external setTokenStrategy
   external setDelegateAddress
   external setBaseGasAmountSpent
   external deposit
   external queueWithdrawals
   external completeQueuedWithdrawal
   external getTokenBalanceFromStrategy
   external getStakedETHBalance
   external stakeEth
   external verifyWithdrawalCredentials
   external verifyAndProcessWithdrawals
   external withdrawNonBeaconChainETHBalanceWei
   external recoverTokens
   external startDelayedWithdrawUnstakedETH
   public getStrategyIndex
   internal _deposit
   internal _recordGas
   internal _refundGas

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

1: 
   Current order:
   public initialize
   external setWithdrawQueue
   external setFeeConfig
   external setRestakeManager
   external depositETHFromProtocol
   external fillERC20withdrawBuffer
   external forwardFullWithdrawalETH
   external stakeEthFromQueue
   external stakeEthFromQueueMulti
   external sweepERC20
   internal _refundGas
   internal _checkAndFillETHWithdrawBuffer
   
   Suggested order:
   external setWithdrawQueue
   external setFeeConfig
   external setRestakeManager
   external depositETHFromProtocol
   external fillERC20withdrawBuffer
   external forwardFullWithdrawalETH
   external stakeEthFromQueue
   external stakeEthFromQueueMulti
   external sweepERC20
   public initialize
   internal _refundGas
   internal _checkAndFillETHWithdrawBuffer

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

1: 
   Current order:
   public initialize
   external decimals
   external description
   external version
   external getRoundData
   external latestRoundData
   internal _getWBETHData
   
   Suggested order:
   external decimals
   external description
   external version
   external getRoundData
   external latestRoundData
   public initialize
   internal _getWBETHData

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

1: 
   Current order:
   public initialize
   external decimals
   external description
   external version
   external getRoundData
   external latestRoundData
   internal _getMETHData
   
   Suggested order:
   external decimals
   external description
   external version
   external getRoundData
   external latestRoundData
   public initialize
   internal _getMETHData

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

1: 
   Current order:
   public initialize
   external setOracleAddress
   public lookupTokenValue
   external lookupTokenAmountFromValue
   external lookupTokenValues
   external calculateMintAmount
   external calculateRedeemAmount
   
   Suggested order:
   external setOracleAddress
   external lookupTokenAmountFromValue
   external lookupTokenValues
   external calculateMintAmount
   external calculateRedeemAmount
   public initialize
   public lookupTokenValue

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

1: 
   Current order:
   public initialize
   external isRoleManagerAdmin
   external isEzETHMinterBurner
   external isOperatorDelegatorAdmin
   external isOracleAdmin
   external isRestakeManagerAdmin
   external isTokenAdmin
   external isNativeEthRestakeAdmin
   external isERC20RewardsAdmin
   external isDepositWithdrawPauser
   external isBridgeAdmin
   external isPriceFeedSender
   external isWithdrawQueueAdmin
   
   Suggested order:
   external isRoleManagerAdmin
   external isEzETHMinterBurner
   external isOperatorDelegatorAdmin
   external isOracleAdmin
   external isRestakeManagerAdmin
   external isTokenAdmin
   external isNativeEthRestakeAdmin
   external isERC20RewardsAdmin
   external isDepositWithdrawPauser
   external isBridgeAdmin
   external isPriceFeedSender
   external isWithdrawQueueAdmin
   public initialize

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

1: 
   Current order:
   public initialize
   external getRate
   
   Suggested order:
   external getRate
   public initialize

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

1: 
   Current order:
   public initialize
   external setPaused
   external getOperatorDelegatorsLength
   external addOperatorDelegator
   external removeOperatorDelegator
   external setOperatorDelegatorAllocation
   external setMaxDepositTVL
   external addCollateralToken
   external removeCollateralToken
   external getCollateralTokensLength
   public calculateTVLs
   public chooseOperatorDelegatorForDeposit
   public chooseOperatorDelegatorForWithdraw
   public getCollateralTokenIndex
   external deposit
   public deposit
   external depositETH
   public depositETH
   external stakeEthInOperatorDelegator
   external depositTokenRewardsFromProtocol
   external getTotalRewardsEarned
   external setTokenTvlLimit
   
   Suggested order:
   external setPaused
   external getOperatorDelegatorsLength
   external addOperatorDelegator
   external removeOperatorDelegator
   external setOperatorDelegatorAllocation
   external setMaxDepositTVL
   external addCollateralToken
   external removeCollateralToken
   external getCollateralTokensLength
   external deposit
   external depositETH
   external stakeEthInOperatorDelegator
   external depositTokenRewardsFromProtocol
   external getTotalRewardsEarned
   external setTokenTvlLimit
   public initialize
   public calculateTVLs
   public chooseOperatorDelegatorForDeposit
   public chooseOperatorDelegatorForWithdraw
   public getCollateralTokenIndex
   public deposit
   public depositETH

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

1: 
   Current order:
   public initialize
   external forwardRewards
   internal _forwardETH
   external setRewardDestination
   
   Suggested order:
   external forwardRewards
   external setRewardDestination
   public initialize
   internal _forwardETH

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

1: 
   Current order:
   external initialize
   external updateWithdrawBufferTarget
   external updateCoolDownPeriod
   external pause
   external unpause
   public getAvailableToWithdraw
   public getBufferDeficit
   external fillEthWithdrawBuffer
   external fillERC20WithdrawBuffer
   external withdraw
   public getOutstandingWithdrawRequests
   external claim
   
   Suggested order:
   external initialize
   external updateWithdrawBufferTarget
   external updateCoolDownPeriod
   external pause
   external unpause
   external fillEthWithdrawBuffer
   external fillERC20WithdrawBuffer
   external withdraw
   external claim
   public getAvailableToWithdraw
   public getBufferDeficit
   public getOutstandingWithdrawRequests

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="NC-11"></a>[NC-11] Functions should not be longer than 50 lines
Overly complex code can make understanding functionality more difficult, try to further modularize your code to ensure readability 

*Instances (131)*:
```solidity
File: contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol

10:     function getXERC20(address erc20) external view returns (address xerc20);

12:     function getERC20(address xerc20) external view returns (address erc20);

14:     function getLockbox(address erc20) external view returns (address xerc20);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol)

```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

294:     function recoverNative(uint256 _amount, address _to) external onlyBridgeAdmin {

305:     function recoverERC20(address _token, uint256 _amount, address _to) external onlyBridgeAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

23:     function initialize(AggregatorV3Interface _oracle) public initializer {

36:     function setOracleAddress(AggregatorV3Interface _oracleAddress) external onlyOwner {

50:     function getMintRate() public view returns (uint256, uint256) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

96:     function updateXRenzoBridgeL1(address _newXRenzoBridgeL1) external onlyOwner {

107:     function updateCCIPEthChainSelector(uint64 _newChainSelector) external onlyOwner {

134:     function setRenzoDeposit(address _newXRenzoDeposit) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

92:     function updateXRenzoBridgeL1(address _newXRenzoBridgeL1) external onlyOwner {

103:     function updateCCIPEthChainSelector(uint32 _newChainDomain) external onlyOwner {

130:     function setRenzoDeposit(address _newXRenzoDeposit) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

277:     function getBridgeFeeShare(uint256 _amountIn) public view returns (uint256) {

289:     function getMintRate() public view returns (uint256, uint256) {

310:     function updatePrice(uint256 _price, uint256 _timestamp) external override {

320:     function updatePriceByOwner(uint256 price) external onlyOwner {

330:     function _updatePrice(uint256 _price, uint256 _timestamp) internal {

367:     function _trade(uint256 _amountIn, uint256 _deadline) internal returns (uint256) {

456:     function getRate() external view override returns (uint256) {

466:     function setAllowedBridgeSweeper(address _sweeper, bool _allowed) external onlyOwner {

478:     function recoverNative(uint256 _amount, address _to) external onlyOwner {

489:     function recoverERC20(address _token, uint256 _amount, address _to) external onlyOwner {

501:     function setOraclePriceFeed(IRenzoOracleL2 _oracle) external onlyOwner {

511:     function setReceiverPriceFeed(address _receiver) external onlyOwner {

521:     function updateBridgeFeeShare(uint256 _newShare) external onlyOwner {

532:     function updateSweepBatchSize(uint256 _newBatchSize) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

96:     function mint(address _user, uint256 _amount) public virtual {

107:     function burn(address _user, uint256 _amount) public virtual {

152:     function mintingMaxLimitOf(address _bridge) public view returns (uint256 _limit) {

163:     function burningMaxLimitOf(address _bridge) public view returns (uint256 _limit) {

174:     function mintingCurrentLimitOf(address _bridge) public view returns (uint256 _limit) {

190:     function burningCurrentLimitOf(address _bridge) public view returns (uint256 _limit) {

205:     function _useMinterLimits(address _bridge, uint256 _change) internal {

217:     function _useBurnerLimits(address _bridge, uint256 _change) internal {

230:     function _changeMinterLimit(address _bridge, uint256 _limit) internal {

252:     function _changeBurnerLimit(address _bridge, uint256 _limit) internal {

328:     function _burnWithCaller(address _caller, address _user, uint256 _amount) internal {

348:     function _mintWithCaller(address _caller, address _user, uint256 _amount) internal {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

44:     function initialize(address _xerc20, address _erc20, bool _isNative) public initializer {

79:     function depositTo(address _to, uint256 _amount) external {

91:     function depositNativeTo(address _to) public payable {

114:     function withdrawTo(address _to, uint256 _amount) external {

125:     function _withdraw(address _to, uint256 _amount) internal {

145:     function _deposit(address _to, uint256 _amount) internal {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol

56:     function remoteToken() public view override returns (address) {

60:     function bridge() public view override returns (address) {

64:     function mint(address _to, uint256 _amount) public override(XERC20, IOptimismMintableERC20) {

68:     function burn(address _from, uint256 _amount) public override(XERC20, IOptimismMintableERC20) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

101:     function activateRestaking() external nonReentrant onlyNativeEthRestakeAdmin {

162:     function _deposit(IERC20 _token, uint256 _tokenAmount) internal returns (uint256 shares) {

172:     function getStrategyIndex(IStrategy _strategy) public view returns (uint256) {

327:     function getTokenBalanceFromStrategy(IERC20 token) external view returns (uint256) {

338:     function getStakedETHBalance() external view returns (uint256) {

459:     function startDelayedWithdrawUnstakedETH() external onlyNativeEthRestakeAdmin {

470:     function _recordGas(uint256 initialGas) internal {

481:     function _refundGas() internal returns (uint256) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

74:     function initialize(IRoleManager _roleManager) public initializer {

87:     function setWithdrawQueue(IWithdrawQueue _withdrawQueue) external onlyRestakeManagerAdmin {

112:     function setRestakeManager(IRestakeManager _restakeManager) external onlyRestakeManagerAdmin {

123:     function depositETHFromProtocol() external payable onlyRestakeManager {

152:     function forwardFullWithdrawalETH() external payable nonReentrant {

254:     function sweepERC20(IERC20 token) external onlyERC20RewardsAdmin {

283:     function _refundGas(uint256 initialGas) internal {

294:     function _checkAndFillETHWithdrawBuffer(uint256 _amount) internal {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

23:     function initialize(IStakedTokenV2 _wBETHToken) public initializer {

29:     function decimals() external pure returns (uint8) {

33:     function description() external pure returns (string memory) {

37:     function version() external pure returns (uint256) {

42:     function getRoundData(uint80) external pure returns (uint80, int256, uint256, uint256, uint80) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

23:     function initialize(IMethStaking _methStaking) public initializer {

29:     function decimals() external pure returns (uint8) {

33:     function description() external pure returns (string memory) {

37:     function version() external pure returns (uint256) {

42:     function getRoundData(uint80) external pure returns (uint80, int256, uint256, uint256, uint80) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

44:     function initialize(IRoleManager _roleManager) public initializer {

71:     function lookupTokenValue(IERC20 _token, uint256 _balance) public view returns (uint256) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

22:     function initialize(address roleManagerAdmin) public initializer {

32:     function isRoleManagerAdmin(address potentialAddress) external view returns (bool) {

38:     function isEzETHMinterBurner(address potentialAddress) external view returns (bool) {

44:     function isOperatorDelegatorAdmin(address potentialAddress) external view returns (bool) {

50:     function isOracleAdmin(address potentialAddress) external view returns (bool) {

56:     function isRestakeManagerAdmin(address potentialAddress) external view returns (bool) {

62:     function isTokenAdmin(address potentialAddress) external view returns (bool) {

68:     function isNativeEthRestakeAdmin(address potentialAddress) external view returns (bool) {

74:     function isERC20RewardsAdmin(address potentialAddress) external view returns (bool) {

80:     function isDepositWithdrawPauser(address potentialAddress) external view returns (bool) {

86:     function isBridgeAdmin(address potentialAddress) external view returns (bool) {

92:     function isPriceFeedSender(address potentialAddress) external view returns (bool) {

98:     function isWithdrawQueueAdmin(address potentialAddress) external view returns (bool) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

29:     function getRate() external view returns (uint256) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

121:     function setPaused(bool _paused) external onlyDepositWithdrawPauserAdmin {

126:     function getOperatorDelegatorsLength() external view returns (uint256) {

215:     function setMaxDepositTVL(uint256 _maxDepositTVL) external onlyRestakeManagerAdmin {

220:     function addCollateralToken(IERC20 _newCollateralToken) external onlyRestakeManagerAdmin {

266:     function getCollateralTokensLength() external view returns (uint256) {

274:     function calculateTVLs() public view returns (uint256[][] memory, uint256[] memory, uint256) {

451:     function getCollateralTokenIndex(IERC20 _collateralToken) public view returns (uint256) {

473:     function deposit(IERC20 _collateralToken, uint256 _amount) external {

592:     function depositETH(uint256 _referralId) public payable nonReentrant notPaused {

675:     function getTotalRewardsEarned() external view returns (uint256) {

709:     function setTokenTvlLimit(IERC20 _token, uint256 _limit) external onlyRestakeManagerAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

38:     function initialize(IRoleManager _roleManager, address _rewardDestination) public initializer {

58:     function forwardRewards() external nonReentrant onlyNativeEthRestakeAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/TimelockController.sol

154:     function isOperation(bytes32 id) public view virtual returns (bool) {

161:     function isOperationPending(bytes32 id) public view virtual returns (bool) {

168:     function isOperationReady(bytes32 id) public view virtual returns (bool) {

176:     function isOperationDone(bytes32 id) public view virtual returns (bool) {

184:     function getTimestamp(bytes32 id) public view virtual returns (uint256) {

193:     function getMinDelay() public view virtual returns (uint256) {

283:     function _schedule(bytes32 id, uint256 delay) private {

296:     function cancel(bytes32 id) public virtual onlyRole(CANCELLER_ROLE) {

368:     function _execute(address target, uint256 value, bytes calldata data) internal virtual {

376:     function _beforeCall(bytes32 id, bytes32 predecessor) private view {

402:     function updateDelay(uint256 newDelay) external virtual {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

129:     function updateCoolDownPeriod(uint256 _newCoolDownPeriod) external onlyWithdrawQueueAdmin {

139:     function pause() external onlyWithdrawQueueAdmin {

147:     function unpause() external onlyWithdrawQueueAdmin {

156:     function getAvailableToWithdraw(address _asset) public view returns (uint256) {

170:     function getBufferDeficit(address _asset) public view returns (uint256) {

182:     function fillEthWithdrawBuffer() external payable nonReentrant onlyDepositQueue {

206:     function withdraw(uint256 _amount, address _assetOut) external nonReentrant {

270:     function getOutstandingWithdrawRequests(address user) public view returns (uint256) {

279:     function claim(uint256 withdrawRequestIndex) external nonReentrant {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthToken.sol

33:     function initialize(IRoleManager _roleManager) public initializer {

41:     function mint(address to, uint256 amount) external onlyMinterBurner {

46:     function burn(address from, uint256 amount) external onlyMinterBurner {

51:     function setPaused(bool _paused) external onlyTokenAdmin {

77:     function name() public view virtual override returns (string memory) {

85:     function symbol() public view virtual override returns (string memory) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthToken.sol)

### <a name="NC-12"></a>[NC-12] Change int to int256
Throughout the code base, some variables are declared as `int`. To favor explicitness, consider changing all instances of `int` to `int256`

*Instances (2)*:
```solidity
File: contracts/RestakeManager.sol

565:         uint256 ezETHToMint = renzoOracle.calculateMintAmount(

605:         uint256 ezETHToMint = renzoOracle.calculateMintAmount(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="NC-13"></a>[NC-13] Change uint to uint256
Throughout the code base, some variables are declared as `uint`. To favor explicitness, consider changing all instances of `uint` to `uint256`

*Instances (2)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

37:         uint nonce,

38:         uint startBlock,

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

### <a name="NC-14"></a>[NC-14] Lack of checks in setters
Be it sanity checks (like checks against `0`-values) or initial setting checks: it's best for Setter functions to have them

*Instances (7)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

320:     function updatePriceByOwner(uint256 price) external onlyOwner {
             return _updatePrice(price, block.timestamp);

466:     function setAllowedBridgeSweeper(address _sweeper, bool _allowed) external onlyOwner {
             allowedBridgeSweepers[_sweeper] = _allowed;
     
             emit BridgeSweeperAddressUpdated(_sweeper, _allowed);

501:     function setOraclePriceFeed(IRenzoOracleL2 _oracle) external onlyOwner {
             emit OraclePriceFeedUpdated(address(_oracle), address(oracle));
             oracle = _oracle;

511:     function setReceiverPriceFeed(address _receiver) external onlyOwner {
             emit ReceiverPriceFeedUpdated(_receiver, receiver);
             receiver = _receiver;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/RestakeManager.sol

121:     function setPaused(bool _paused) external onlyDepositWithdrawPauserAdmin {
             paused = _paused;

215:     function setMaxDepositTVL(uint256 _maxDepositTVL) external onlyRestakeManagerAdmin {
             maxDepositTVL = _maxDepositTVL;

709:     function setTokenTvlLimit(IERC20 _token, uint256 _limit) external onlyRestakeManagerAdmin {
             // Verify collateral token is in the list - call will revert if not found
             getCollateralTokenIndex(_token);
     
             // Set the limit
             collateralTokenTvlLimits[_token] = _limit;
     
             emit CollateralTokenTvlUpdated(_token, _limit);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="NC-15"></a>[NC-15] Missing Event for critical parameters change
Events help non-contract tools to track changes, and events prevent users from being surprised by changes.

*Instances (4)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

310:     function updatePrice(uint256 _price, uint256 _timestamp) external override {
             if (msg.sender != receiver) revert InvalidSender(receiver, msg.sender);
             _updatePrice(_price, _timestamp);

320:     function updatePriceByOwner(uint256 price) external onlyOwner {
             return _updatePrice(price, block.timestamp);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/RestakeManager.sol

121:     function setPaused(bool _paused) external onlyDepositWithdrawPauserAdmin {
             paused = _paused;

215:     function setMaxDepositTVL(uint256 _maxDepositTVL) external onlyRestakeManagerAdmin {
             maxDepositTVL = _maxDepositTVL;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="NC-16"></a>[NC-16] NatSpec is completely non-existent on functions that should have them
Public and external functions that aren't view or pure should have NatSpec comments

*Instances (5)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

23:     function initialize(AggregatorV3Interface _oracle) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

69:     function xReceive(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

132:     function setBaseGasAmountSpent(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/RestakeManager.sol

709:     function setTokenTvlLimit(IERC20 _token, uint256 _limit) external onlyRestakeManagerAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

72:     function setRewardDestination(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

### <a name="NC-17"></a>[NC-17] Incomplete NatSpec: `@param` is missing on actually documented functions
The following functions are missing `@param` NatSpec comments.

*Instances (34)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

69:     /// @dev Initializes the contract with initial vars
        function initialize(
            IERC20 _ezETH,
            IERC20 _xezETH,
            IRestakeManager _restakeManager,
            IERC20 _wETH,
            IXERC20Lockbox _xezETHLockbox,
            IConnext _connext,
            IRouterClient _linkRouterClient,
            IRateProvider _rateProvider,
            LinkTokenInterface _linkToken,
            IRoleManager _roleManager

129:     /**
          * @notice  Accepts collateral from the bridge
          * @dev     This function will take all collateral and deposit it into Renzo
          *          The ezETH from the deposit will be sent to the lockbox to be wrapped into xezETH
          *          The xezETH will be burned so that the xezETH on the L2 can be unwrapped for ezETH later
          * @notice  WARNING: This function does NOT whitelist who can send funds from the L2 via Connext.  Users should NOT
          *          send funds directly to this contract.  A user who sends funds directly to this contract will cause
          *          the tokens on the L2 to become over collateralized and will be a "donation" to protocol.  Only use
          *          the deposit contracts on the L2 to send funds to this contract.
          */
         function xReceive(
             bytes32 _transferId,
             uint256 _amount,
             address _asset,
             address _originSender,
             uint32 _origin,
             bytes memory

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

35:     /// @dev Sets addresses for oracle lookup.  Permission gated to owner only.
        function setOracleAddress(AggregatorV3Interface _oracleAddress) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

63:     /**
         * @notice  Initializes the contract with initial vars
         * @dev     All tokens are expected to have 18 decimals
         * @param   _currentPrice  Initializes it with an initial price of ezETH to ETH
         * @param   _xezETH  L2 ezETH token
         * @param   _depositToken  WETH on L2
         * @param   _collateralToken  nextWETH on L2
         * @param   _connext  Connext contract
         * @param   _swapKey  Swap key for the connext contract swap from WETH to nextWETH
         * @param   _receiver Renzo Receiver middleware contract for price feed
         * @param   _oracle Price feed oracle for ezETH
         */
        function initialize(
            uint256 _currentPrice,
            IERC20 _xezETH,
            IERC20 _depositToken,
            IERC20 _collateralToken,
            IConnext _connext,
            bytes32 _swapKey,
            address _receiver,
            uint32 _bridgeDestinationDomain,
            address _bridgeTargetAddress,
            IRenzoOracleL2 _oracle

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

73:     /// @dev Initializes the contract with initial vars
        function initialize(
            IRoleManager _roleManager,
            IStrategyManager _strategyManager,
            IRestakeManager _restakeManager,
            IDelegationManager _delegationManager,
            IEigenPodManager _eigenPodManager

105:     /// @dev Sets the strategy for a given token - setting strategy to 0x0 removes the ability to deposit and withdraw token
         function setTokenStrategy(
             IERC20 _token,
             IStrategy _strategy

116:     /// @dev Sets the address to delegate tokens to in EigenLayer -- THIS CAN ONLY BE SET ONCE
         function setDelegateAddress(
             address _delegateAddress,
             ISignatureUtils.SignatureWithExpiry memory approverSignatureAndExpiry,
             bytes32 approverSalt

140:     /// @dev Deposit tokens into the EigenLayer.  This call assumes any balance of tokens in this contract will be delegated
         /// so do not directly send tokens here or they will be delegated and attributed to the next caller.
         /// @return shares The amount of new shares in the `strategy` created as part of the action.
         function deposit(
             IERC20 token,
             uint256 tokenAmount

347:     /// @dev Stake ETH in the EigenLayer
         /// Only the Restake Manager should call this function
         function stakeEth(
             bytes calldata pubkey,
             bytes calldata signature,
             bytes32 depositDataRoot

361:     /// @dev Verifies the withdrawal credentials for a withdrawal
         /// This will allow the EigenPodManager to verify the withdrawal credentials and credit the OD with shares
         /// Only the native eth restake admin should call this function
         function verifyWithdrawalCredentials(
             uint64 oracleTimestamp,
             BeaconChainProofs.StateRootProof calldata stateRootProof,
             uint40[] calldata validatorIndices,
             bytes[] calldata withdrawalCredentialProofs,
             bytes32[][] calldata validatorFields

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

73:     /// @dev Initializes the contract with initial vars
        function initialize(IRoleManager _roleManager) public initializer {

92:     /// @dev Sets the config for fees - if either value is set to 0 then fees are disabled
        function setFeeConfig(
            address _feeAddress,
            uint256 _feeBasisPoints

111:     /// @dev Sets the address of the RestakeManager contract
         function setRestakeManager(IRestakeManager _restakeManager) external onlyRestakeManagerAdmin {

185:     /// @dev Function called by ETH Restake Admin to start the restaking process in Native ETH
         /// Only callable by a permissioned account
         function stakeEthFromQueue(
             IOperatorDelegator operatorDelegator,
             bytes calldata pubkey,
             bytes calldata signature,
             bytes32 depositDataRoot

208:     /// @dev Function called by ETH Restake Admin to start the restaking process in Native ETH
         /// Only callable by a permissioned account
         /// Can stake multiple validators with 1 tx
         function stakeEthFromQueueMulti(
             IOperatorDelegator[] calldata operatorDelegators,
             bytes[] calldata pubkeys,
             bytes[] calldata signatures,
             bytes32[] calldata depositDataRoots

252:     /// @dev Sweeps any accumulated ERC20 tokens in this contract to the RestakeManager
         /// Only callable by a permissioned account
         function sweepERC20(IERC20 token) external onlyERC20RewardsAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

22:     /// @dev Initializes the contract with initial vars
        function initialize(IStakedTokenV2 _wBETHToken) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

22:     /// @dev Initializes the contract with initial vars
        function initialize(IMethStaking _methStaking) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

43:     /// @dev Initializes the contract with initial vars
        function initialize(IRoleManager _roleManager) public initializer {

52:     /// @dev Sets addresses for oracle lookup.  Permission gated to oracel admins only.
        /// Set to address 0x0 to disable lookups for the token.
        function setOracleAddress(
            IERC20 _token,
            AggregatorV3Interface _oracleAddress

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

21:     /// @dev initializer to call after deployment, can only be called once
        function initialize(address roleManagerAdmin) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

16:     /// @dev Initializes the contract with initial vars
        function initialize(
            IRestakeManager _restakeManager,
            IERC20Upgradeable _ezETHToken

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

100:     /// @dev Initializes the contract with initial vars
         function initialize(
             IRoleManager _roleManager,
             IEzEthToken _ezETH,
             IRenzoOracle _renzoOracle,
             IStrategyManager _strategyManager,
             IDelegationManager _delegationManager,
             IDepositQueue _depositQueue

120:     /// @dev Allows a restake manager admin to set the paused state of the contract
         function setPaused(bool _paused) external onlyDepositWithdrawPauserAdmin {

130:     /// @dev Allows a restake manager admin to add an OperatorDelegator to the list
         function addOperatorDelegator(
             IOperatorDelegator _newOperatorDelegator,
             uint256 _allocationBasisPoints

159:     /// @dev Allows a restake manager admin to remove an OperatorDelegator from the list
         function removeOperatorDelegator(
             IOperatorDelegator _operatorDelegatorToRemove

186:     /// @dev Allows restake manager admin to set an OperatorDelegator allocation
         function setOperatorDelegatorAllocation(
             IOperatorDelegator _operatorDelegator,
             uint256 _allocationBasisPoints

214:     /// @dev Allows a restake manager admin to set the max TVL for deposits.  If set to 0, no deposits will be enforced.
         function setMaxDepositTVL(uint256 _maxDepositTVL) external onlyRestakeManagerAdmin {

219:     /// @dev Allows restake manager to add a collateral token
         function addCollateralToken(IERC20 _newCollateralToken) external onlyRestakeManagerAdmin {

243:     /// @dev Allows restake manager to remove a collateral token
         function removeCollateralToken(
             IERC20 _collateralTokenToRemove

618:     /// @dev Called by the deposit queue to stake ETH to a validator
         /// Only callable by the deposit queue
         function stakeEthInOperatorDelegator(
             IOperatorDelegator operatorDelegator,
             bytes calldata pubkey,
             bytes calldata signature,
             bytes32 depositDataRoot

645:     /// @dev Deposit ERC20 token rewards from the Deposit Queue
         /// Only callable by the deposit queue
         function depositTokenRewardsFromProtocol(
             IERC20 _token,
             uint256 _amount

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

37:     /// @dev Initializes the contract with initial vars
        function initialize(IRoleManager _roleManager, address _rewardDestination) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

61:     /**
         * @notice  Initializes the contract with initial vars
         */
        function initialize(
            IRoleManager _roleManager,
            IRestakeManager _restakeManager,
            IEzEthToken _ezETH,
            IRenzoOracle _renzoOracle,
            uint256 _coolDownPeriod,
            TokenWithdrawBuffer[] calldata _withdrawalBufferTarget

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="NC-18"></a>[NC-18] Incomplete NatSpec: `@return` is missing on actually documented functions
The following functions are missing `@return` NatSpec comments.

*Instances (1)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

129:     /**
          * @notice  Accepts collateral from the bridge
          * @dev     This function will take all collateral and deposit it into Renzo
          *          The ezETH from the deposit will be sent to the lockbox to be wrapped into xezETH
          *          The xezETH will be burned so that the xezETH on the L2 can be unwrapped for ezETH later
          * @notice  WARNING: This function does NOT whitelist who can send funds from the L2 via Connext.  Users should NOT
          *          send funds directly to this contract.  A user who sends funds directly to this contract will cause
          *          the tokens on the L2 to become over collateralized and will be a "donation" to protocol.  Only use
          *          the deposit contracts on the L2 to send funds to this contract.
          */
         function xReceive(
             bytes32 _transferId,
             uint256 _amount,
             address _asset,
             address _originSender,
             uint32 _origin,
             bytes memory
         ) external nonReentrant returns (bytes memory) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

### <a name="NC-19"></a>[NC-19] Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor
If a function is supposed to be access-controlled, a `modifier` should be used instead of a `require/if` statement for more readability.

*Instances (29)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

51:         if (!roleManager.isBridgeAdmin(msg.sender)) revert NotBridgeAdmin();

56:         if (!roleManager.isPriceFeedSender(msg.sender)) revert NotPriceFeedSender();

148:         if (msg.sender != address(connext)) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

311:         if (msg.sender != receiver) revert InvalidSender(receiver, msg.sender);

416:         if (!allowedBridgeSweepers[msg.sender]) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

108:         if (msg.sender != _user) {

122:         if (msg.sender != FACTORY) revert IXERC20_NotFactory();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

115:         if (XERC20(_xerc20).owner() != msg.sender) revert IXERC20Factory_NotOwner();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

51:         if (!roleManager.isOperatorDelegatorAdmin(msg.sender)) revert NotOperatorDelegatorAdmin();

57:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

63:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

503:         if (msg.sender == address(eigenPod)) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

45:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

51:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

57:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

63:         if (!roleManager.isERC20RewardsAdmin(msg.sender)) revert NotERC20RewardsAdmin();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

30:         if (!roleManager.isOracleAdmin(msg.sender)) revert NotOracleAdmin();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

72:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

78:         if (!roleManager.isDepositWithdrawPauser(msg.sender)) revert NotDepositWithdrawPauser();

84:         if (msg.sender != address(depositQueue)) revert NotDepositQueue();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

19:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

25:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/TimelockController.sol

403:         require(msg.sender == address(this), "TimelockController: caller must be timelock");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

40:         if (!roleManager.isWithdrawQueueAdmin(msg.sender)) revert NotWithdrawQueueAdmin();

46:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

51:         if (msg.sender != address(restakeManager.depositQueue())) revert NotDepositQueue();

281:         if (withdrawRequestIndex >= withdrawRequests[msg.sender].length)

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthToken.sol

16:         if (!roleManager.isEzETHMinterBurner(msg.sender)) revert NotEzETHMinterBurner();

22:         if (!roleManager.isTokenAdmin(msg.sender)) revert NotTokenAdmin();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthToken.sol)

### <a name="NC-20"></a>[NC-20] Constant state variables defined more than once
Rather than redefining state variable constant, consider using a library to store all constants as this will prevent data redundancy

*Instances (7)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

61:     uint8 public constant EXPECTED_DECIMALS = 18;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

13:     uint256 public constant MAX_TIME_WINDOW = 86400 + 60; // 24 hours + 60 seconds

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

37:     uint8 public constant EXPECTED_DECIMALS = 18;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

26:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

13:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

26:     uint256 constant MAX_TIME_WINDOW = 86400 + 60; // 24 hours + 60 seconds

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Withdraw/WithdrawQueueStorage.sol

10:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueueStorage.sol)

### <a name="NC-21"></a>[NC-21] Consider using named mappings
Consider moving to solidity version 0.8.18 or later, and using [named mappings](https://ethereum.stackexchange.com/questions/51629/how-to-name-the-arguments-in-mapping/145555#145555) to make it easier to understand the purpose of each mapping

*Instances (15)*:
```solidity
File: contracts/Bridge/L2/xRenzoDepositStorage.sol

44:     mapping(address => bool) public allowedBridgeSweepers;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDepositStorage.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

41:     mapping(address => Bridge) public bridges;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

20:     mapping(address => address) internal _lockboxRegistry;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Delegation/OperatorDelegatorStorage.sol

28:     mapping(IERC20 => IStrategy) public tokenStrategyMapping;

56:     mapping(address => uint256) public adminGasSpentInWei;

61:     mapping(address => uint256) public queuedShares;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegatorStorage.sol)

```solidity
File: contracts/Deposits/DepositQueueStorage.sol

23:     mapping(address => uint256) public totalEarned;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueueStorage.sol)

```solidity
File: contracts/Oracle/RenzoOracleStorage.sol

13:     mapping(IERC20 => AggregatorV3Interface) public tokenOracleLookup;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracleStorage.sol)

```solidity
File: contracts/RestakeManagerStorage.sol

39:     mapping(bytes32 => PendingWithdrawal) public pendingWithdrawals;

46:     mapping(IOperatorDelegator => uint256) public operatorDelegatorAllocations;

65:     mapping(IERC20 => uint256) public collateralTokenTvlLimits;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManagerStorage.sol)

```solidity
File: contracts/TimelockController.sol

32:     mapping(bytes32 => uint256) private _timestamps;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

```solidity
File: contracts/Withdraw/WithdrawQueueStorage.sol

44:     mapping(address => uint256) public withdrawalBufferTarget;

47:     mapping(address => uint256) public claimReserve;

50:     mapping(address => WithdrawRequest[]) public withdrawRequests;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueueStorage.sol)

### <a name="NC-22"></a>[NC-22] `address`s shouldn't be hard-coded
It is often better to declare `address`es as `immutable`, and assign them via constructor arguments. This allows the code to remain the same across deployments on different networks, and avoids recompilation when addresses need to change.

*Instances (3)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

26:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

13:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Withdraw/WithdrawQueueStorage.sol

10:     address public constant IS_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueueStorage.sol)

### <a name="NC-23"></a>[NC-23] Owner can renounce while system is paused
The contract owner or single user with a role is not prevented from renouncing the role/ownership while the contract is paused, which would cause any user assets stored in the protocol, to be locked indefinitely.

*Instances (4)*:
```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

117:     function unPause() external onlyOwner {

125:     function pause() external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

113:     function unPause() external onlyOwner {

121:     function pause() external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

### <a name="NC-24"></a>[NC-24] Adding a `return` statement when the function defines a named return variable, is redundant

*Instances (6)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

140:     /// @dev Deposit tokens into the EigenLayer.  This call assumes any balance of tokens in this contract will be delegated
         /// so do not directly send tokens here or they will be delegated and attributed to the next caller.
         /// @return shares The amount of new shares in the `strategy` created as part of the action.
         function deposit(
             IERC20 token,
             uint256 tokenAmount
         ) external nonReentrant onlyRestakeManager returns (uint256 shares) {
             if (address(tokenStrategyMapping[token]) == address(0x0) || tokenAmount == 0)
                 revert InvalidZeroInput();
     
             // Move the tokens into this contract
             token.safeTransferFrom(msg.sender, address(this), tokenAmount);
     
             return _deposit(token, tokenAmount);

156:     /**
          * @notice  Perform necessary checks on input data and deposits into EigenLayer
          * @param   _token  token interface to deposit
          * @param   _tokenAmount  amount of given token to deposit
          * @return  shares  shares for deposited amount
          */
         function _deposit(IERC20 _token, uint256 _tokenAmount) internal returns (uint256 shares) {
             // Approve the strategy manager to spend the tokens
             _token.safeApprove(address(strategyManager), _tokenAmount);
     
             // Deposit the tokens via the strategy manager
             return

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

46:     function latestRoundData()
            external
            view
            returns (
                uint80 roundId,
                int256 answer,
                uint256 startedAt,
                uint256 updatedAt,
                uint80 answeredInRound
            )
        {
            return _getWBETHData();

60:     /**
         * @notice  This function gets the price of 1 mETH in ETH from the mETH staking contract with 18 decimal precision
         * @dev     This function does not implement the full Chainlink AggregatorV3Interface
         * @return  roundId  0 - never returns valid round ID
         * @return  answer  The conversion rate of 1 mETH to ETH.
         * @return  startedAt  0 - never returns valid timestamp
         * @return  updatedAt  The current timestamp.
         * @return  answeredInRound  0 - never returns valid round ID
         */
        function _getWBETHData()
            internal
            view
            returns (
                uint80 roundId,
                int256 answer,
                uint256 startedAt,
                uint256 updatedAt,
                uint80 answeredInRound
            )
        {
            return (0, int256(wBETHToken.exchangeRate()), 0, block.timestamp, 0);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

46:     function latestRoundData()
            external
            view
            returns (
                uint80 roundId,
                int256 answer,
                uint256 startedAt,
                uint256 updatedAt,
                uint80 answeredInRound
            )
        {
            return _getMETHData();

60:     /**
         * @notice  This function gets the price of 1 mETH in ETH from the mETH staking contract with 18 decimal precision
         * @dev     This function does not implement the full Chainlink AggregatorV3Interface
         * @return  roundId  0 - never returns valid round ID
         * @return  answer  The conversion rate of 1 mETH to ETH.
         * @return  startedAt  0 - never returns valid timestamp
         * @return  updatedAt  The current timestamp.
         * @return  answeredInRound  0 - never returns valid round ID
         */
        function _getMETHData()
            internal
            view
            returns (
                uint80 roundId,
                int256 answer,
                uint256 startedAt,
                uint256 updatedAt,
                uint80 answeredInRound
            )
        {
            return (0, int256(methStaking.mETHToETH(1 ether)), 0, block.timestamp, 0);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

### <a name="NC-25"></a>[NC-25] Take advantage of Custom Error's return value property
An important feature of Custom Error is that values such as address, tokenID, msg.value can be written inside the () sign, this kind of approach provides a serious advantage in debugging and examining the revert details of dapps such as tenderly.

*Instances (150)*:
```solidity
File: contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol

42:             revert InvalidAddress();

66:             revert AmountLessThanZero();

74:             revert InvalidAddress();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol)

```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

51:         if (!roleManager.isBridgeAdmin(msg.sender)) revert NotBridgeAdmin();

56:         if (!roleManager.isPriceFeedSender(msg.sender)) revert NotPriceFeedSender();

95:             revert InvalidZeroInput();

154:             revert InvalidTokenReceived();

159:             revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

27:         if (address(_oracle) == address(0)) revert InvalidZeroInput();

30:         if (_oracle.decimals() > 18) revert InvalidTokenDecimals(18, _oracle.decimals());

37:         if (address(_oracleAddress) == address(0)) revert InvalidZeroInput();

40:             revert InvalidTokenDecimals(18, _oracleAddress.decimals());

52:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

55:         if (_scaledPrice < 1 ether) revert InvalidOraclePrice();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

48:         if (_xRenzoBridgeL1 == address(0) || _ccipEthChainSelector == 0) revert InvalidZeroInput();

97:         if (_newXRenzoBridgeL1 == address(0)) revert InvalidZeroInput();

108:         if (_newChainSelector == 0) revert InvalidZeroInput();

135:         if (_newXRenzoDeposit == address(0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

48:         ) revert UnAuthorisedCall();

54:             revert InvalidZeroInput();

93:         if (_newXRenzoBridgeL1 == address(0)) revert InvalidZeroInput();

104:         if (_newChainDomain == 0) revert InvalidZeroInput();

131:         if (_newXRenzoDeposit == address(0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

101:             revert InvalidZeroInput();

173:             revert InvalidZeroInput();

187:             revert InvalidZeroOutput();

210:             revert InvalidZeroInput();

241:             revert InvalidZeroOutput();

249:             revert OraclePriceExpired();

257:             revert InsufficientOutputAmount();

291:         if (receiver == address(0) && address(oracle) == address(0)) revert PriceFeedNotAvailable();

333:             revert InvalidZeroInput();

341:             revert InvalidOraclePrice();

404:         if (!success) revert TransferFailed();

417:             revert UnauthorizedBridgeSweeper();

425:             revert InvalidZeroOutput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

122:         if (msg.sender != FACTORY) revert IXERC20_NotFactory();

330:         if (_amount == 0) revert IXERC20_INVALID_0_VALUE();

334:             if (_currentLimit < _amount) revert IXERC20_NotHighEnoughLimits();

350:         if (_amount == 0) revert IXERC20_INVALID_0_VALUE();

354:             if (_currentLimit < _amount) revert IXERC20_NotHighEnoughLimits();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

112:             revert IXERC20Factory_BadTokenAddress();

115:         if (XERC20(_xerc20).owner() != msg.sender) revert IXERC20Factory_NotOwner();

116:         if (_lockboxRegistry[_xerc20] != address(0)) revert IXERC20Factory_LockboxAlreadyDeployed();

145:             revert IXERC20Factory_InvalidLength();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

55:         if (!IS_NATIVE) revert IXERC20Lockbox_NotNative();

67:         if (IS_NATIVE) revert IXERC20Lockbox_Native();

80:         if (IS_NATIVE) revert IXERC20Lockbox_Native();

92:         if (!IS_NATIVE) revert IXERC20Lockbox_NotNative();

132:             if (!_success) revert IXERC20Lockbox_WithdrawFailed();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

84:             revert IXERC20Factory_InvalidLength();

87:             revert OptimismMintableXERC20Factory_NoBridges();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

51:         if (!roleManager.isOperatorDelegatorAdmin(msg.sender)) revert NotOperatorDelegatorAdmin();

57:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

63:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

81:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

82:         if (address(_strategyManager) == address(0x0)) revert InvalidZeroInput();

83:         if (address(_restakeManager) == address(0x0)) revert InvalidZeroInput();

84:         if (address(_delegationManager) == address(0x0)) revert InvalidZeroInput();

85:         if (address(_eigenPodManager) == address(0x0)) revert InvalidZeroInput();

110:         if (address(_token) == address(0x0)) revert InvalidZeroInput();

122:         if (address(_delegateAddress) == address(0x0)) revert InvalidZeroInput();

123:         if (address(delegateAddress) != address(0x0)) revert DelegateAddressAlreadySet();

135:         if (_baseGasAmountSpent == 0) revert InvalidZeroInput();

148:             revert InvalidZeroInput();

183:         revert NotFound();

199:         if (tokens.length != tokenAmounts.length) revert MismatchedArrayLengths();

218:                     revert InvalidZeroInput();

271:         if (tokens.length != withdrawal.strategies.length) revert MismatchedArrayLengths();

278:             if (address(tokens[i]) == address(0)) revert InvalidZeroInput();

486:         if (!success) revert TransferFailed();

521:             if (!success) revert TransferFailed();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

45:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

51:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

57:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

63:         if (!roleManager.isERC20RewardsAdmin(msg.sender)) revert NotERC20RewardsAdmin();

77:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

88:         if (address(_withdrawQueue) == address(0)) revert InvalidZeroInput();

99:             if (_feeAddress == address(0x0)) revert InvalidZeroInput();

103:         if (_feeBasisPoints > 10000) revert OverMaxBasisPoints();

113:         if (address(_restakeManager) == address(0x0)) revert InvalidZeroInput();

138:         if (_amount == 0 || _asset == address(0)) revert InvalidZeroInput();

169:             if (!success) revert TransferFailed();

223:         ) revert MismatchedArrayLengths();

287:         if (!success) revert TransferFailed();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

24:         if (address(_wBETHToken) == address(0x0)) revert InvalidZeroInput();

43:         revert NotImplemented();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

24:         if (address(_methStaking) == address(0x0)) revert InvalidZeroInput();

43:         revert NotImplemented();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

30:         if (!roleManager.isOracleAdmin(msg.sender)) revert NotOracleAdmin();

45:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

58:         if (address(_token) == address(0x0)) revert InvalidZeroInput();

62:             revert InvalidTokenDecimals(18, _oracleAddress.decimals());

73:         if (address(oracle) == address(0x0)) revert OracleNotFound();

76:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

77:         if (price <= 0) revert InvalidOraclePrice();

90:         if (address(oracle) == address(0x0)) revert OracleNotFound();

93:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

94:         if (price <= 0) revert InvalidOraclePrice();

107:         if (_tokens.length != _balances.length) revert MismatchedArrayLengths();

146:         if (mintAmount == 0) revert InvalidTokenAmount();

161:         if (redeemAmount == 0) revert InvalidTokenAmount();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

23:         if (address(roleManagerAdmin) == address(0x0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

21:         if (address(_restakeManager) == address(0x0)) revert InvalidZeroInput();

22:         if (address(_ezETHToken) == address(0x0)) revert InvalidZeroInput();

37:         if (totalSupply == 0 || totalTVL == 0) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

72:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

78:         if (!roleManager.isDepositWithdrawPauser(msg.sender)) revert NotDepositWithdrawPauser();

84:         if (msg.sender != address(depositQueue)) revert NotDepositQueue();

90:         if (paused) revert ContractPaused();

139:                 revert AlreadyAdded();

146:         if (_allocationBasisPoints > (100 * BASIS_POINTS)) revert OverMaxBasisPoints();

183:         revert NotFound();

191:         if (address(_operatorDelegator) == address(0x0)) revert InvalidZeroInput();

192:         if (_allocationBasisPoints > (100 * BASIS_POINTS)) revert OverMaxBasisPoints();

206:         if (!foundOd) revert NotFound();

224:             if (address(collateralTokens[i]) == address(_newCollateralToken)) revert AlreadyAdded();

262:         revert NotFound();

367:         if (operatorDelegators.length == 0) revert NotFound();

411:                 revert NotFound();

446:         revert NotFound();

464:         revert NotFound();

511:             revert MaxTVLReached();

530:                 revert MaxTokenTVLReached();

598:             revert MaxTVLReached();

639:         if (!found) revert NotFound();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

19:         if (!roleManager.isNativeEthRestakeAdmin(msg.sender)) revert NotNativeEthRestakeAdmin();

25:         if (!roleManager.isRestakeManagerAdmin(msg.sender)) revert NotRestakeManagerAdmin();

41:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

42:         if (address(_rewardDestination) == address(0x0)) revert InvalidZeroInput();

69:         if (!success) revert TransferFailed();

75:         if (address(_rewardDestination) == address(0x0)) revert InvalidZeroInput();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

40:         if (!roleManager.isWithdrawQueueAdmin(msg.sender)) revert NotWithdrawQueueAdmin();

46:         if (msg.sender != address(restakeManager)) revert NotRestakeManager();

51:         if (msg.sender != address(restakeManager.depositQueue())) revert NotDepositQueue();

79:         ) revert InvalidZeroInput();

92:             ) revert InvalidZeroInput();

109:         if (_newBufferTarget.length == 0) revert InvalidZeroInput();

112:                 revert InvalidZeroInput();

130:         if (_newCoolDownPeriod == 0) revert InvalidZeroInput();

196:         if (_asset == address(0) || _amount == 0) revert InvalidZeroInput();

208:         if (_amount == 0 || _assetOut == address(0)) revert InvalidZeroInput();

211:         if (withdrawalBufferTarget[_assetOut] == 0) revert UnsupportedWithdrawAsset();

236:         if (amountToRedeem > getAvailableToWithdraw(_assetOut)) revert NotEnoughWithdrawBuffer();

282:             revert InvalidWithdrawIndex();

287:         if (block.timestamp - _withdrawRequest.createdAt < coolDownPeriod) revert EarlyClaim();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthToken.sol

16:         if (!roleManager.isEzETHMinterBurner(msg.sender)) revert NotEzETHMinterBurner();

22:         if (!roleManager.isTokenAdmin(msg.sender)) revert NotTokenAdmin();

34:         if (address(_roleManager) == address(0x0)) revert InvalidZeroInput();

70:             revert ContractPaused();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthToken.sol)

### <a name="NC-26"></a>[NC-26] Use scientific notation (e.g. `1e18`) rather than exponentiation (e.g. `10**18`)
While this won't save gas in the recent solidity versions, this is shorter and more readable (this is especially true in calculations).

*Instances (2)*:
```solidity
File: contracts/Oracle/RenzoOracle.sol

23:     uint256 constant SCALE_FACTOR = 10 ** 18;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

40:         return (10 ** 18 * totalTVL) / totalSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

### <a name="NC-27"></a>[NC-27] Contract does not follow the Solidity style guide's suggested layout ordering
The [style guide](https://docs.soliditylang.org/en/v0.8.16/style-guide.html#order-of-layout) says that, within a contract, the ordering should be:

1) Type declarations
2) State variables
3) Events
4) Modifiers
5) Functions

However, the contract(s) below do not follow this ordering

*Instances (6)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

1: 
   Current order:
   UsingForDirective.IERC20
   EventDefinition.EzETHMinted
   EventDefinition.MessageSent
   EventDefinition.ConnextMessageSent
   ModifierDefinition.onlyBridgeAdmin
   ModifierDefinition.onlyPriceFeedSender
   VariableDeclaration.EXPECTED_DECIMALS
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.xReceive
   FunctionDefinition.sendPrice
   FunctionDefinition.recoverNative
   FunctionDefinition.recoverERC20
   FunctionDefinition.receive
   
   Suggested order:
   UsingForDirective.IERC20
   VariableDeclaration.EXPECTED_DECIMALS
   EventDefinition.EzETHMinted
   EventDefinition.MessageSent
   EventDefinition.ConnextMessageSent
   ModifierDefinition.onlyBridgeAdmin
   ModifierDefinition.onlyPriceFeedSender
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.xReceive
   FunctionDefinition.sendPrice
   FunctionDefinition.recoverNative
   FunctionDefinition.recoverERC20
   FunctionDefinition.receive

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

1: 
   Current order:
   VariableDeclaration.INVALID_0_INPUT
   VariableDeclaration.SCALE_FACTOR
   VariableDeclaration.MAX_TIME_WINDOW
   ModifierDefinition.onlyOracleAdmin
   EventDefinition.OracleAddressUpdated
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.setOracleAddress
   FunctionDefinition.lookupTokenValue
   FunctionDefinition.lookupTokenAmountFromValue
   FunctionDefinition.lookupTokenValues
   FunctionDefinition.calculateMintAmount
   FunctionDefinition.calculateRedeemAmount
   
   Suggested order:
   VariableDeclaration.INVALID_0_INPUT
   VariableDeclaration.SCALE_FACTOR
   VariableDeclaration.MAX_TIME_WINDOW
   EventDefinition.OracleAddressUpdated
   ModifierDefinition.onlyOracleAdmin
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.setOracleAddress
   FunctionDefinition.lookupTokenValue
   FunctionDefinition.lookupTokenAmountFromValue
   FunctionDefinition.lookupTokenValues
   FunctionDefinition.calculateMintAmount
   FunctionDefinition.calculateRedeemAmount

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

1: 
   Current order:
   UsingForDirective.IERC20
   UsingForDirective.IEzEthToken
   EventDefinition.OperatorDelegatorAdded
   EventDefinition.OperatorDelegatorRemoved
   EventDefinition.OperatorDelegatorAllocationUpdated
   EventDefinition.CollateralTokenAdded
   EventDefinition.CollateralTokenRemoved
   VariableDeclaration.BASIS_POINTS
   EventDefinition.Deposit
   EventDefinition.UserWithdrawStarted
   EventDefinition.UserWithdrawCompleted
   EventDefinition.CollateralTokenTvlUpdated
   ModifierDefinition.onlyRestakeManagerAdmin
   ModifierDefinition.onlyDepositWithdrawPauserAdmin
   ModifierDefinition.onlyDepositQueue
   ModifierDefinition.notPaused
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.setPaused
   FunctionDefinition.getOperatorDelegatorsLength
   FunctionDefinition.addOperatorDelegator
   FunctionDefinition.removeOperatorDelegator
   FunctionDefinition.setOperatorDelegatorAllocation
   FunctionDefinition.setMaxDepositTVL
   FunctionDefinition.addCollateralToken
   FunctionDefinition.removeCollateralToken
   FunctionDefinition.getCollateralTokensLength
   FunctionDefinition.calculateTVLs
   FunctionDefinition.chooseOperatorDelegatorForDeposit
   FunctionDefinition.chooseOperatorDelegatorForWithdraw
   FunctionDefinition.getCollateralTokenIndex
   FunctionDefinition.deposit
   FunctionDefinition.deposit
   FunctionDefinition.depositETH
   FunctionDefinition.depositETH
   FunctionDefinition.stakeEthInOperatorDelegator
   FunctionDefinition.depositTokenRewardsFromProtocol
   FunctionDefinition.getTotalRewardsEarned
   FunctionDefinition.setTokenTvlLimit
   
   Suggested order:
   UsingForDirective.IERC20
   UsingForDirective.IEzEthToken
   VariableDeclaration.BASIS_POINTS
   EventDefinition.OperatorDelegatorAdded
   EventDefinition.OperatorDelegatorRemoved
   EventDefinition.OperatorDelegatorAllocationUpdated
   EventDefinition.CollateralTokenAdded
   EventDefinition.CollateralTokenRemoved
   EventDefinition.Deposit
   EventDefinition.UserWithdrawStarted
   EventDefinition.UserWithdrawCompleted
   EventDefinition.CollateralTokenTvlUpdated
   ModifierDefinition.onlyRestakeManagerAdmin
   ModifierDefinition.onlyDepositWithdrawPauserAdmin
   ModifierDefinition.onlyDepositQueue
   ModifierDefinition.notPaused
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.setPaused
   FunctionDefinition.getOperatorDelegatorsLength
   FunctionDefinition.addOperatorDelegator
   FunctionDefinition.removeOperatorDelegator
   FunctionDefinition.setOperatorDelegatorAllocation
   FunctionDefinition.setMaxDepositTVL
   FunctionDefinition.addCollateralToken
   FunctionDefinition.removeCollateralToken
   FunctionDefinition.getCollateralTokensLength
   FunctionDefinition.calculateTVLs
   FunctionDefinition.chooseOperatorDelegatorForDeposit
   FunctionDefinition.chooseOperatorDelegatorForWithdraw
   FunctionDefinition.getCollateralTokenIndex
   FunctionDefinition.deposit
   FunctionDefinition.deposit
   FunctionDefinition.depositETH
   FunctionDefinition.depositETH
   FunctionDefinition.stakeEthInOperatorDelegator
   FunctionDefinition.depositTokenRewardsFromProtocol
   FunctionDefinition.getTotalRewardsEarned
   FunctionDefinition.setTokenTvlLimit

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/RestakeManagerStorage.sol

1: 
   Current order:
   VariableDeclaration.roleManager
   VariableDeclaration.ezETH
   VariableDeclaration.strategyManager
   VariableDeclaration.delegationManager
   StructDefinition.PendingWithdrawal
   VariableDeclaration.pendingWithdrawals
   VariableDeclaration.operatorDelegators
   VariableDeclaration.operatorDelegatorAllocations
   VariableDeclaration.collateralTokens
   VariableDeclaration.renzoOracle
   VariableDeclaration.paused
   VariableDeclaration.maxDepositTVL
   VariableDeclaration.depositQueue
   VariableDeclaration.collateralTokenTvlLimits
   
   Suggested order:
   VariableDeclaration.roleManager
   VariableDeclaration.ezETH
   VariableDeclaration.strategyManager
   VariableDeclaration.delegationManager
   VariableDeclaration.pendingWithdrawals
   VariableDeclaration.operatorDelegators
   VariableDeclaration.operatorDelegatorAllocations
   VariableDeclaration.collateralTokens
   VariableDeclaration.renzoOracle
   VariableDeclaration.paused
   VariableDeclaration.maxDepositTVL
   VariableDeclaration.depositQueue
   VariableDeclaration.collateralTokenTvlLimits
   StructDefinition.PendingWithdrawal

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManagerStorage.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

1: 
   Current order:
   ModifierDefinition.onlyNativeEthRestakeAdmin
   ModifierDefinition.onlyRestakeManagerAdmin
   EventDefinition.RewardDestinationUpdated
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.receive
   FunctionDefinition.forwardRewards
   FunctionDefinition._forwardETH
   FunctionDefinition.setRewardDestination
   
   Suggested order:
   EventDefinition.RewardDestinationUpdated
   ModifierDefinition.onlyNativeEthRestakeAdmin
   ModifierDefinition.onlyRestakeManagerAdmin
   FunctionDefinition.constructor
   FunctionDefinition.initialize
   FunctionDefinition.receive
   FunctionDefinition.forwardRewards
   FunctionDefinition._forwardETH
   FunctionDefinition.setRewardDestination

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueueStorage.sol

1: 
   Current order:
   VariableDeclaration.IS_NATIVE
   StructDefinition.TokenWithdrawBuffer
   StructDefinition.WithdrawRequest
   VariableDeclaration.renzoOracle
   VariableDeclaration.ezETH
   VariableDeclaration.roleManager
   VariableDeclaration.restakeManager
   VariableDeclaration.coolDownPeriod
   VariableDeclaration.withdrawRequestNonce
   VariableDeclaration.withdrawalBufferTarget
   VariableDeclaration.claimReserve
   VariableDeclaration.withdrawRequests
   
   Suggested order:
   VariableDeclaration.IS_NATIVE
   VariableDeclaration.renzoOracle
   VariableDeclaration.ezETH
   VariableDeclaration.roleManager
   VariableDeclaration.restakeManager
   VariableDeclaration.coolDownPeriod
   VariableDeclaration.withdrawRequestNonce
   VariableDeclaration.withdrawalBufferTarget
   VariableDeclaration.claimReserve
   VariableDeclaration.withdrawRequests
   StructDefinition.TokenWithdrawBuffer
   StructDefinition.WithdrawRequest

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueueStorage.sol)

### <a name="NC-28"></a>[NC-28] Use Underscores for Number Literals (add an underscore every 3 digits)

*Instances (6)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

13:     uint256 public constant MAX_TIME_WINDOW = 86400 + 60; // 24 hours + 60 seconds

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

40:     uint32 public constant FEE_BASIS = 10000;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

103:         if (_feeBasisPoints > 10000) revert OverMaxBasisPoints();

167:             feeAmount = (msg.value * feeBasisPoints) / 10000;

261:                 feeAmount = (balance * feeBasisPoints) / 10000;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

26:     uint256 constant MAX_TIME_WINDOW = 86400 + 60; // 24 hours + 60 seconds

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

### <a name="NC-29"></a>[NC-29] Event is missing `indexed` fields
Index event fields make the field more quickly accessible to off-chain tools that parse events. However, note that each index field costs extra gas during emission, so it's not necessarily best to index the maximum allowed per event (three fields). Each event should use three indexed fields if there are three or more fields, and gas usage is not particularly of concern for the events in question. If there are fewer than three fields, all of the fields should be indexed.

*Instances (56)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

25:     event EzETHMinted(

34:     event MessageSent(

43:     event ConnextMessageSent(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

15:     event OracleAddressUpdated(address newOracle, address oldOracle);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

24:     event XRenzoBridgeL1Updated(address newBridgeAddress, address oldBridgeAddress);

25:     event CCIPEthChainSelectorUpdated(uint64 newSourceChainSelector, uint64 oldSourceChainSelector);

26:     event XRenzoDepositUpdated(address newRenzoDeposit, address oldRenzoDeposit);

35:     event MessageReceived(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

23:     event XRenzoBridgeL1Updated(address newBridgeAddress, address oldBridgeAddress);

24:     event ConnextEthChainDomainUpdated(uint32 newSourceChainDomain, uint32 oldSourceChainDomain);

25:     event XRenzoDepositUpdated(address newRenzoDeposit, address oldRenzoDeposit);

35:     event MessageReceived(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

42:     event PriceUpdated(uint256 price, uint256 timestamp);

43:     event Deposit(address indexed user, uint256 amountIn, uint256 amountOut);

44:     event BridgeSweeperAddressUpdated(address sweeper, bool allowed);

45:     event BridgeSwept(

51:     event OraclePriceFeedUpdated(address newOracle, address oldOracle);

52:     event ReceiverPriceFeedUpdated(address newReceiver, address oldReceiver);

53:     event SweeperBridgeFeeCollected(address sweeper, uint256 feeCollected);

54:     event BridgeFeeShareUpdated(uint256 oldBridgeFeeShare, uint256 newBridgeFeeShare);

55:     event SweepBatchSizeUpdated(uint256 oldSweepBatchSize, uint256 newSweepBatchSize);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

28:     event TokenStrategyUpdated(IERC20 token, IStrategy strategy);

29:     event DelegationAddressUpdated(address delegateAddress);

30:     event RewardsForwarded(address rewardDestination, uint256 amount);

32:     event WithdrawStarted(

43:     event WithdrawCompleted(bytes32 withdrawalRoot, IStrategy[] strategies, uint256[] shares);

45:     event GasSpent(address admin, uint256 gasSpent);

46:     event GasRefunded(address admin, uint256 gasRefunded);

47:     event BaseGasAmountSpentUpdated(uint256 oldBaseGasAmountSpent, uint256 newBaseGasAmountSpent);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

15:     event RewardsDeposited(IERC20 token, uint256 amount);

17:     event FeeConfigUpdated(address feeAddress, uint256 feeBasisPoints);

19:     event RestakeManagerUpdated(IRestakeManager restakeManager);

21:     event ETHDepositedFromProtocol(uint256 amount);

23:     event ETHStakedFromQueue(

30:     event ProtocolFeesPaid(IERC20 token, uint256 amount, address destination);

32:     event GasRefunded(address admin, uint256 gasRefunded);

35:     event WithdrawQueueUpdated(address oldWithdrawQueue, address newWithdrawQueue);

38:     event BufferFilled(address token, uint256 amount);

41:     event FullWithdrawalETHReceived(uint256 amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

35:     event OracleAddressUpdated(IERC20 token, AggregatorV3Interface oracleAddress);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

30:     event OperatorDelegatorAdded(IOperatorDelegator od);

31:     event OperatorDelegatorRemoved(IOperatorDelegator od);

32:     event OperatorDelegatorAllocationUpdated(IOperatorDelegator od, uint256 allocation);

34:     event CollateralTokenAdded(IERC20 token);

35:     event CollateralTokenRemoved(IERC20 token);

41:     event Deposit(

50:     event UserWithdrawStarted(

59:     event UserWithdrawCompleted(

68:     event CollateralTokenTvlUpdated(IERC20 token, uint256 tvl);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

29:     event RewardDestinationUpdated(address rewardDestination);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

19:     event WithdrawBufferTargetUpdated(uint256 oldBufferTarget, uint256 newBufferTarget);

21:     event CoolDownPeriodUpdated(uint256 oldCoolDownPeriod, uint256 newCoolDownPeriod);

23:     event EthBufferFilled(uint256 amount);

25:     event ERC20BufferFilled(address asset, uint256 amount);

27:     event WithdrawRequestCreated(

36:     event WithdrawRequestClaimed(WithdrawRequest withdrawRequest);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="NC-30"></a>[NC-30] Constants should be defined rather than using magic numbers

*Instances (4)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

30:         if (_oracle.decimals() > 18) revert InvalidTokenDecimals(18, _oracle.decimals());

40:             revert InvalidTokenDecimals(18, _oracleAddress.decimals());

54:         uint256 _scaledPrice = (uint256(price)) * 10 ** (18 - oracle.decimals());

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

62:             revert InvalidTokenDecimals(18, _oracleAddress.decimals());

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

### <a name="NC-31"></a>[NC-31] `public` functions not called by the contract should be declared `external` instead

*Instances (17)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

70:     function initialize(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

23:     function initialize(AggregatorV3Interface _oracle) public initializer {

50:     function getMintRate() public view returns (uint256, uint256) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

75:     function initialize(

414:     function sweep() public payable nonReentrant {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

172:     function getStrategyIndex(IStrategy _strategy) public view returns (uint256) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

74:     function initialize(IRoleManager _roleManager) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

23:     function initialize(IStakedTokenV2 _wBETHToken) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

23:     function initialize(IMethStaking _methStaking) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

44:     function initialize(IRoleManager _roleManager) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

22:     function initialize(address roleManagerAdmin) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

17:     function initialize(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

101:     function initialize(

400:     function chooseOperatorDelegatorForWithdraw(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

38:     function initialize(IRoleManager _roleManager, address _rewardDestination) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

170:     function getBufferDeficit(address _asset) public view returns (uint256) {

270:     function getOutstandingWithdrawRequests(address user) public view returns (uint256) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="NC-32"></a>[NC-32] Variables need not be initialized to zero
The default value for variables is zero, so initializing them to zero is superfluous.

*Instances (37)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

218:         for (uint256 i = 0; i < _destinationParam.length; ) {

264:         for (uint256 i = 0; i < _connextDestinationParam.length; ) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

372:         uint256 minOut = 0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

176:         for (uint256 i = 0; i < strategyLength; i++) {

381:         for (uint256 i = 0; i < validatorFields.length; ) {

507:             uint256 gasRefunded = 0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

164:         uint256 feeAmount = 0;

227:         for (uint256 i = 0; i < arrayLength; ) {

257:             uint256 feeAmount = 0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

109:         uint256 totalValue = 0;

111:         for (uint256 i = 0; i < tokenLength; ) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

137:         for (uint256 i = 0; i < odLength; ) {

165:         for (uint256 i = 0; i < odLength; ) {

197:         for (uint256 i = 0; i < odLength; ) {

223:         for (uint256 i = 0; i < tokenLength; ) {

249:         for (uint256 i = 0; i < tokenLength; ) {

277:         uint256 totalTVL = 0;

287:         uint256 totalWithdrawalQueueValue = 0;

289:         for (uint256 i = 0; i < odLength; ) {

291:             uint256 operatorTVL = 0;

299:             for (uint256 j = 0; j < tokenLength; ) {

376:         for (uint256 i = 0; i < tvlLength; ) {

418:         for (uint256 i = 0; i < odLength; ) {

435:         for (uint256 i = 0; i < odLength; ) {

454:         for (uint256 i = 0; i < tokenLength; ) {

517:             uint256 currentTokenTVL = 0;

521:             for (uint256 i = 0; i < odLength; ) {

629:         for (uint256 i = 0; i < odLength; ) {

676:         uint256 totalRewards = 0;

683:         for (uint256 i = 0; i < tokenLength; ) {

699:         for (uint256 i = 0; i < odLength; ) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/TimelockController.sol

107:         for (uint256 i = 0; i < proposers.length; ++i) {

113:         for (uint256 i = 0; i < executors.length; ++i) {

272:         for (uint256 i = 0; i < targets.length; ++i) {

355:         for (uint256 i = 0; i < targets.length; ++i) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

88:         for (uint256 i = 0; i < _withdrawalBufferTarget.length; ) {

110:         for (uint256 i = 0; i < _newBufferTarget.length; ) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)


## Low Issues


| |Issue|Instances|
|-|:-|:-:|
| [L-1](#L-1) | `approve()`/`safeApprove()` may revert if the current approval is not zero | 13 |
| [L-2](#L-2) | Use of `tx.origin` is unsafe in almost every context | 6 |
| [L-3](#L-3) | Use a 2-step ownership transfer pattern | 3 |
| [L-4](#L-4) | Some tokens may revert when zero value transfers are made | 10 |
| [L-5](#L-5) | Use of `tx.origin` is unsafe in almost every context | 6 |
| [L-6](#L-6) | `decimals()` is not a part of the ERC-20 standard | 15 |
| [L-7](#L-7) | Deprecated approve() function | 2 |
| [L-8](#L-8) | Do not use deprecated library functions | 16 |
| [L-9](#L-9) | `safeApprove()` is deprecated | 11 |
| [L-10](#L-10) | Deprecated _setupRole() function | 5 |
| [L-11](#L-11) | Division by zero not prevented | 6 |
| [L-12](#L-12) | Empty `receive()/payable fallback()` function does not authenticate requests | 2 |
| [L-13](#L-13) | External calls in an un-bounded `for-`loop may result in a DOS | 9 |
| [L-14](#L-14) | External call recipient may consume all transaction gas | 6 |
| [L-15](#L-15) | Initializers could be front-run | 44 |
| [L-16](#L-16) | Signature use at deadlines should be allowed | 7 |
| [L-17](#L-17) | Owner can renounce while system is paused | 4 |
| [L-18](#L-18) | Possible rounding issue | 2 |
| [L-19](#L-19) | Loss of precision | 7 |
| [L-20](#L-20) | Solidity version 0.8.20+ may not work on other chains due to `PUSH0` | 18 |
| [L-21](#L-21) | Use `Ownable2Step.transferOwnership` instead of `Ownable.transferOwnership` | 3 |
| [L-22](#L-22) | Sweeping may break accounting if tokens with multiple addresses are used | 26 |
| [L-23](#L-23) | Unsafe ERC20 operation(s) | 6 |
| [L-24](#L-24) | Unspecific compiler version pragma | 5 |
| [L-25](#L-25) | Upgradeable contract is missing a `__gap[50]` storage variable to allow for new storage variables in later versions | 37 |
| [L-26](#L-26) | Upgradeable contract not initialized | 109 |
### <a name="L-1"></a>[L-1] `approve()`/`safeApprove()` may revert if the current approval is not zero
- Some tokens (like the *very popular* USDT) do not work when changing the allowance from an existing non-zero allowance value (it will revert if the current approval is not zero to protect against front-running changes of approvals). These tokens must first be approved for zero and then the actual allowance can be approved.
- Furthermore, OZ's implementation of safeApprove would throw an error if an approve is attempted from a non-zero value (`"SafeERC20: approve from non-zero to non-zero allowance"`)

Set the allowance to zero immediately before each of the existing allowance calls

*Instances (13)*:
```solidity
File: contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol

84:         SafeERC20.safeApprove(IERC20(_erc20), lockbox, _amount);

86:         SafeERC20.safeApprove(IERC20(xerc20), blastStandardBridge, _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol)

```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

181:         ezETH.safeApprove(address(xezETHLockbox), ezETHAmount);

241:             linkToken.approve(address(linkRouterClient), fees);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

369:         depositToken.safeApprove(address(connext), _amountIn);

429:         collateralToken.safeApprove(address(connext), balance);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

164:         _token.safeApprove(address(strategyManager), _tokenAmount);

297:                     tokens[i].safeApprove(address(restakeManager.depositQueue()), bufferToFill);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

142:         IERC20(_asset).safeApprove(address(withdrawQueue), _amount);

268:             token.approve(address(restakeManager), balance - feeAmount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/RestakeManager.sol

552:             _collateralToken.safeApprove(address(depositQueue), bufferToFill);

559:         _collateralToken.safeApprove(address(operatorDelegator), _amount);

664:         _token.safeApprove(address(operatorDelegator), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="L-2"></a>[L-2] Use of `tx.origin` is unsafe in almost every context
According to [Vitalik Buterin](https://ethereum.stackexchange.com/questions/196/how-do-i-make-my-dapp-serenity-proof), contracts should _not_ `assume that tx.origin will continue to be usable or meaningful`. An example of this is [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074#allowing-txorigin-as-signer-1) which explicitly mentions the intention to change its semantics when it's used with new op codes. There have also been calls to [remove](https://github.com/ethereum/solidity/issues/683) `tx.origin`, and there are [security issues](solidity.readthedocs.io/en/v0.4.24/security-considerations.html#tx-origin) associated with using it for authorization. For these reasons, it's best to completely avoid the feature.

*Instances (6)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

482:         uint256 gasRefund = address(this).balance >= adminGasSpentInWei[tx.origin]

483:             ? adminGasSpentInWei[tx.origin]

485:         bool success = payable(tx.origin).send(gasRefund);

489:         adminGasSpentInWei[tx.origin] -= gasRefund;

491:         emit GasRefunded(tx.origin, gasRefund);

509:             if (adminGasSpentInWei[tx.origin] > 0) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

### <a name="L-3"></a>[L-3] Use a 2-step ownership transfer pattern
Recommend considering implementing a two step process where the owner or admin nominates an account and the nominated account needs to call an `acceptOwnership()` function for the transfer of ownership to fully succeed. This ensures the nominated EOA account is a valid and active account. Lack of two-step procedure for critical operations leaves them error-prone. Consider adding two step procedure on the critical functions.

*Instances (3)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

11: contract RenzoOracleL2 is Initializable, OwnableUpgradeable, RenzoOracleL2StorageV1 {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

14: contract Receiver is CCIPReceiver, Ownable, Pausable {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

10: contract ConnextReceiver is IXReceiver, Ownable, Pausable {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

### <a name="L-4"></a>[L-4] Some tokens may revert when zero value transfers are made
Example: https://github.com/d-xo/weird-erc20#revert-on-zero-value-transfers.

In spite of the fact that EIP-20 [states](https://github.com/ethereum/EIPs/blob/46b9b698815abbfa628cd1097311deee77dd45c5/EIPS/eip-20.md?plain=1#L116) that zero-valued transfers must be accepted, some tokens, such as LEND will revert if this is attempted, which may cause transactions that involve other tokens (such as batch operations) to fully revert. Consider skipping the transfer if the amount is zero, which will also save gas.

*Instances (10)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

306:         IERC20(_token).safeTransfer(_to, _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

490:         IERC20(_token).safeTransfer(_to, _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

151:         token.safeTransferFrom(msg.sender, address(this), tokenAmount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

140:         IERC20(_asset).safeTransferFrom(msg.sender, address(this), _amount);

262:                 IERC20(token).safeTransfer(feeAddress, feeAmount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/RestakeManager.sol

540:         _collateralToken.safeTransferFrom(msg.sender, address(this), _amount);

661:         _token.safeTransferFrom(msg.sender, address(this), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

197:         IERC20(_asset).safeTransferFrom(msg.sender, address(this), _amount);

214:         IERC20(address(ezETH)).safeTransferFrom(msg.sender, address(this), _amount);

305:             IERC20(_withdrawRequest.collateralToken).transfer(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="L-5"></a>[L-5] Use of `tx.origin` is unsafe in almost every context
According to [Vitalik Buterin](https://ethereum.stackexchange.com/questions/196/how-do-i-make-my-dapp-serenity-proof), contracts should _not_ `assume that tx.origin will continue to be usable or meaningful`. An example of this is [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074#allowing-txorigin-as-signer-1) which explicitly mentions the intention to change its semantics when it's used with new op codes. There have also been calls to [remove](https://github.com/ethereum/solidity/issues/683) `tx.origin`, and there are [security issues](solidity.readthedocs.io/en/v0.4.24/security-considerations.html#tx-origin) associated with using it for authorization. For these reasons, it's best to completely avoid the feature.

*Instances (6)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

482:         uint256 gasRefund = address(this).balance >= adminGasSpentInWei[tx.origin]

483:             ? adminGasSpentInWei[tx.origin]

485:         bool success = payable(tx.origin).send(gasRefund);

489:         adminGasSpentInWei[tx.origin] -= gasRefund;

491:         emit GasRefunded(tx.origin, gasRefund);

509:             if (adminGasSpentInWei[tx.origin] > 0) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

### <a name="L-6"></a>[L-6] `decimals()` is not a part of the ERC-20 standard
The `decimals()` function is not a part of the [ERC-20 standard](https://eips.ethereum.org/EIPS/eip-20), and was added later as an [optional extension](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/IERC20Metadata.sol). As such, some valid ERC20 tokens do not support this interface, so it is unsafe to blindly cast all tokens to this interface, and then call this function.

*Instances (15)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

99:         uint8 decimals = IERC20MetadataUpgradeable(address(_ezETH)).decimals();

103:         decimals = IERC20MetadataUpgradeable(address(_xezETH)).decimals();

107:         decimals = IERC20MetadataUpgradeable(address(_wETH)).decimals();

111:         decimals = IERC20MetadataUpgradeable(address(_linkToken)).decimals();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

30:         if (_oracle.decimals() > 18) revert InvalidTokenDecimals(18, _oracle.decimals());

39:         if (_oracleAddress.decimals() > 18)

40:             revert InvalidTokenDecimals(18, _oracleAddress.decimals());

54:         uint256 _scaledPrice = (uint256(price)) * 10 ** (18 - oracle.decimals());

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

105:         uint8 decimals = IERC20MetadataUpgradeable(address(_depositToken)).decimals();

109:         decimals = IERC20MetadataUpgradeable(address(_collateralToken)).decimals();

113:         decimals = IERC20MetadataUpgradeable(address(_xezETH)).decimals();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

61:         if (_oracleAddress.decimals() != 18)

62:             revert InvalidTokenDecimals(18, _oracleAddress.decimals());

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RestakeManager.sol

231:         if (IERC20Metadata(address(_newCollateralToken)).decimals() != 18)

234:                 IERC20Metadata(address(_newCollateralToken)).decimals()

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="L-7"></a>[L-7] Deprecated approve() function
Due to the inheritance of ERC20's approve function, there's a vulnerability to the ERC20 approve and double spend front running attack. Briefly, an authorized spender could spend both allowances by front running an allowance-changing transaction. Consider implementing OpenZeppelin's `.safeApprove()` function to help mitigate this.

*Instances (2)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

241:             linkToken.approve(address(linkRouterClient), fees);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

268:             token.approve(address(restakeManager), balance - feeAmount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

### <a name="L-8"></a>[L-8] Do not use deprecated library functions

*Instances (16)*:
```solidity
File: contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol

84:         SafeERC20.safeApprove(IERC20(_erc20), lockbox, _amount);

86:         SafeERC20.safeApprove(IERC20(xerc20), blastStandardBridge, _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol)

```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

181:         ezETH.safeApprove(address(xezETHLockbox), ezETHAmount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

369:         depositToken.safeApprove(address(connext), _amountIn);

429:         collateralToken.safeApprove(address(connext), balance);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

164:         _token.safeApprove(address(strategyManager), _tokenAmount);

297:                     tokens[i].safeApprove(address(restakeManager.depositQueue()), bufferToFill);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

142:         IERC20(_asset).safeApprove(address(withdrawQueue), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/RestakeManager.sol

552:             _collateralToken.safeApprove(address(depositQueue), bufferToFill);

559:         _collateralToken.safeApprove(address(operatorDelegator), _amount);

664:         _token.safeApprove(address(operatorDelegator), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/TimelockController.sol

99:         _setupRole(TIMELOCK_ADMIN_ROLE, address(this));

103:             _setupRole(TIMELOCK_ADMIN_ROLE, admin);

108:             _setupRole(PROPOSER_ROLE, proposers[i]);

109:             _setupRole(CANCELLER_ROLE, proposers[i]);

114:             _setupRole(EXECUTOR_ROLE, executors[i]);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="L-9"></a>[L-9] `safeApprove()` is deprecated
[Deprecated](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/bfff03c0d2a59bcd8e2ead1da9aed9edf0080d05/contracts/token/ERC20/utils/SafeERC20.sol#L38-L45) in favor of `safeIncreaseAllowance()` and `safeDecreaseAllowance()`. If only setting the initial allowance to the value that means infinite, `safeIncreaseAllowance()` can be used instead. The function may currently work, but if a bug is found in this version of OpenZeppelin, and the version that you're forced to upgrade to no longer has this function, you'll encounter unnecessary delays in porting and testing replacement contracts.

*Instances (11)*:
```solidity
File: contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol

84:         SafeERC20.safeApprove(IERC20(_erc20), lockbox, _amount);

86:         SafeERC20.safeApprove(IERC20(xerc20), blastStandardBridge, _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/Connext/integration/LockboxAdapterBlast.sol)

```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

181:         ezETH.safeApprove(address(xezETHLockbox), ezETHAmount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

369:         depositToken.safeApprove(address(connext), _amountIn);

429:         collateralToken.safeApprove(address(connext), balance);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

164:         _token.safeApprove(address(strategyManager), _tokenAmount);

297:                     tokens[i].safeApprove(address(restakeManager.depositQueue()), bufferToFill);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

142:         IERC20(_asset).safeApprove(address(withdrawQueue), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/RestakeManager.sol

552:             _collateralToken.safeApprove(address(depositQueue), bufferToFill);

559:         _collateralToken.safeApprove(address(operatorDelegator), _amount);

664:         _token.safeApprove(address(operatorDelegator), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="L-10"></a>[L-10] Deprecated _setupRole() function

*Instances (5)*:
```solidity
File: contracts/TimelockController.sol

99:         _setupRole(TIMELOCK_ADMIN_ROLE, address(this));

103:             _setupRole(TIMELOCK_ADMIN_ROLE, admin);

108:             _setupRole(PROPOSER_ROLE, proposers[i]);

109:             _setupRole(CANCELLER_ROLE, proposers[i]);

114:             _setupRole(EXECUTOR_ROLE, executors[i]);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="L-11"></a>[L-11] Division by zero not prevented
The divisions below take an input parameter which does not have any zero-value checks, which may lead to the functions reverting when zero is passed.

*Instances (6)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

253:         uint256 xezETHAmount = (1e18 * amountOut) / _lastPrice;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

241:         bridges[_bridge].minterParams.ratePerSecond = _limit / _DURATION;

263:         bridges[_bridge].burnerParams.ratePerSecond = _limit / _DURATION;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

97:         return (_value * SCALE_FACTOR) / uint256(price);

158:         uint256 redeemAmount = (_currentValueInProtocol * _ezETHBeingBurned) / _existingEzETHSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

40:         return (10 ** 18 * totalTVL) / totalSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

### <a name="L-12"></a>[L-12] Empty `receive()/payable fallback()` function does not authenticate requests
If the intention is for the Ether to be used, the function should call another function, otherwise it should revert (e.g. require(msg.sender == address(weth))). Having no access control on the function means that someone may send Ether to the contract, and have no way to get anything back out, which is a loss of funds. If the concern is having to spend a small amount of gas to check the sender against an immutable address, the code should at least have a function to rescue unused Ether.

*Instances (2)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

313:     receive() external payable {}

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

542:     receive() external payable {}

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

### <a name="L-13"></a>[L-13] External calls in an un-bounded `for-`loop may result in a DOS
Consider limiting the number of iterations in for-loops that make external calls

*Instances (9)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

224:                 queuedWithdrawalParams[0].shares[i] = tokenStrategyMapping[tokens[i]]

289:                 uint256 balanceOfToken = tokens[i].balanceOf(address(this));

297:                     tokens[i].safeApprove(address(restakeManager.depositQueue()), bufferToFill);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/RestakeManager.sol

302:                 uint256 operatorBalance = operatorDelegators[i].getTokenBalanceFromStrategy(

302:                 uint256 operatorBalance = operatorDelegators[i].getTokenBalanceFromStrategy(

319:                         collateralTokens[j].balanceOf(withdrawQueue)

319:                         collateralTokens[j].balanceOf(withdrawQueue)

329:             uint256 operatorEthBalance = operatorDelegators[i].getStakedETHBalance();

700:             totalRewards += address(operatorDelegators[i].eigenPod()).balance;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

### <a name="L-14"></a>[L-14] External call recipient may consume all transaction gas
There is no limit specified on the amount of gas used, so the recipient can use up all of the transaction's gas, causing it to revert. Use `addr.call{gas: <amount>}("")` or [this](https://github.com/nomad-xyz/ExcessivelySafeCall) library instead.

*Instances (6)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

403:         (bool success, ) = payable(msg.sender).call{ value: feeCollected }("");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

131:             (bool _success, ) = payable(_to).call{ value: _amount }("");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

520:             (bool success, ) = destination.call{ value: remainingAmount }("");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

168:             (bool success, ) = feeAddress.call{ value: feeAmount }("");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

68:         (bool success, ) = rewardDestination.call{ value: balance }("");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/TimelockController.sol

369:         (bool success, ) = target.call{ value: value }(data);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="L-15"></a>[L-15] Initializers could be front-run
Initializers could be front-run, allowing an attacker to either set their own values, take ownership of the contract, and in the best case forcing a re-deployment

*Instances (44)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

70:     function initialize(

81:     ) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

23:     function initialize(AggregatorV3Interface _oracle) public initializer {

25:         __Ownable_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

75:     function initialize(

86:     ) public initializer {

88:         __Ownable_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

61:     function initialize(

65:     ) public initializer {

66:         __XERC20_init(_name, _symbol, _factory);

76:     function __XERC20_init(

81:         __ERC20_init(_name, _symbol);

82:         __ERC20Permit_init(_name);

83:         __Ownable_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

54:     function initialize(

57:     ) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

44:     function initialize(address _xerc20, address _erc20, bool _isNative) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol

35:     function initialize(

41:     ) public initializer {

42:         __ERC165_init();

43:         __XERC20_init(_name, _symbol, _factory);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

74:     function initialize(

80:     ) external initializer {

87:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

74:     function initialize(IRoleManager _roleManager) public initializer {

75:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

23:     function initialize(IStakedTokenV2 _wBETHToken) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

23:     function initialize(IMethStaking _methStaking) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

44:     function initialize(IRoleManager _roleManager) public initializer {

47:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

22:     function initialize(address roleManagerAdmin) public initializer {

25:         __AccessControl_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

17:     function initialize(

20:     ) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

101:     function initialize(

108:     ) public initializer {

109:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

38:     function initialize(IRoleManager _roleManager, address _rewardDestination) public initializer {

39:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

64:     function initialize(

71:     ) external initializer {

81:         __Pausable_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthToken.sol

33:     function initialize(IRoleManager _roleManager) public initializer {

36:         __ERC20_init("ezETH", "Renzo Restaked ETH");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthToken.sol)

### <a name="L-16"></a>[L-16] Signature use at deadlines should be allowed
According to [EIP-2612](https://github.com/ethereum/EIPs/blob/71dc97318013bf2ac572ab63fab530ac9ef419ca/EIPS/eip-2612.md?plain=1#L58), signatures used on exactly the deadline timestamp are supposed to be allowed. While the signature may or may not be used for the exact EIP-2612 use case (transfer approvals), for consistency's sake, all deadlines should follow this semantic. If the timestamp is an expiration rather than a deadline, consider whether it makes more sense to include the expiration timestamp as a valid timestamp, as is done for deadlines.

*Instances (7)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

52:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

350:         if (_timestamp > block.timestamp) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

311:         } else if (_timestamp + _DURATION <= block.timestamp) {

313:         } else if (_timestamp + _DURATION > block.timestamp) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

76:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

93:         if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/TimelockController.sol

170:         return timestamp > _DONE_TIMESTAMP && timestamp <= block.timestamp;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="L-17"></a>[L-17] Owner can renounce while system is paused
The contract owner or single user with a role is not prevented from renouncing the role/ownership while the contract is paused, which would cause any user assets stored in the protocol, to be locked indefinitely.

*Instances (4)*:
```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

117:     function unPause() external onlyOwner {

125:     function pause() external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

113:     function unPause() external onlyOwner {

121:     function pause() external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

### <a name="L-18"></a>[L-18] Possible rounding issue
Division by large numbers may result in the result being zero, due to solidity not supporting fractions. Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator. Also, there is indication of multiplication and division without the use of parenthesis which could result in issues.

*Instances (2)*:
```solidity
File: contracts/Oracle/RenzoOracle.sol

158:         uint256 redeemAmount = (_currentValueInProtocol * _ezETHBeingBurned) / _existingEzETHSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

40:         return (10 ** 18 * totalTVL) / totalSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

### <a name="L-19"></a>[L-19] Loss of precision
Division by large numbers may result in the result being zero, due to solidity not supporting fractions. Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator

*Instances (7)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

280:             return (_amountIn * bridgeFeeShare) / FEE_BASIS;

282:             return (sweepBatchSize * bridgeFeeShare) / FEE_BASIS;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

241:         bridges[_bridge].minterParams.ratePerSecond = _limit / _DURATION;

263:         bridges[_bridge].burnerParams.ratePerSecond = _limit / _DURATION;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

80:         return (uint256(price) * _balance) / SCALE_FACTOR;

158:         uint256 redeemAmount = (_currentValueInProtocol * _ezETHBeingBurned) / _existingEzETHSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

40:         return (10 ** 18 * totalTVL) / totalSupply;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

### <a name="L-20"></a>[L-20] Solidity version 0.8.20+ may not work on other chains due to `PUSH0`
The compiler for Solidity 0.8.20 switches the default target EVM version to [Shanghai](https://blog.soliditylang.org/2023/05/10/solidity-0.8.20-release-announcement/#important-note), which includes the new `PUSH0` op code. This op code may not yet be implemented on all L2s, so deployment on these chains will fail. To work around this issue, use an earlier [EVM](https://docs.soliditylang.org/en/v0.8.20/using-the-compiler.html?ref=zaryabs.com#setting-the-evm-version-to-target) [version](https://book.getfoundry.sh/reference/config/solidity-compiler#evm_version). While the project itself may or may not compile with 0.8.20, other projects with which it integrates, or which extend this project may, and those projects will have problems deploying these contracts/libraries.

*Instances (18)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Errors/Errors.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Errors/Errors.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/Permissions/RoleManagerStorage.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManagerStorage.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RestakeManager.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthTokenStorage.sol

2: pragma solidity 0.8.19;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthTokenStorage.sol)

### <a name="L-21"></a>[L-21] Use `Ownable2Step.transferOwnership` instead of `Ownable.transferOwnership`
Use [Ownable2Step.transferOwnership](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable2Step.sol) which is safer. Use it as it is more secure due to 2-stage ownership transfer.

**Recommended Mitigation Steps**

Use <a href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable2Step.sol">Ownable2Step.sol</a>
  
  ```solidity
      function acceptOwnership() external {
          address sender = _msgSender();
          require(pendingOwner() == sender, "Ownable2Step: caller is not the new owner");
          _transferOwnership(sender);
      }
```

*Instances (3)*:
```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

85:         _transferOwnership(_factory);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

171:         XERC20(_xerc20).transferOwnership(msg.sender);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

117:         OptimismMintableXERC20(_xerc20).transferOwnership(msg.sender);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

### <a name="L-22"></a>[L-22] Sweeping may break accounting if tokens with multiple addresses are used
There have been [cases](https://blog.openzeppelin.com/compound-tusd-integration-issue-retrospective/) in the past where a token mistakenly had two addresses that could control its balance, and transfers using one address impacted the balance of the other. To protect against this potential scenario, sweep functions should ensure that the balance of the non-sweepable token does not change after the transfer of the swept tokens.

*Instances (26)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

305:     function recoverERC20(address _token, uint256 _amount, address _to) external onlyBridgeAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

44:     event BridgeSweeperAddressUpdated(address sweeper, bool allowed);

53:     event SweeperBridgeFeeCollected(address sweeper, uint256 feeCollected);

55:     event SweepBatchSizeUpdated(uint256 oldSweepBatchSize, uint256 newSweepBatchSize);

155:         sweepBatchSize = 32 ether;

279:         if (_amountIn < sweepBatchSize) {

282:             return (sweepBatchSize * bridgeFeeShare) / FEE_BASIS;

405:         emit SweeperBridgeFeeCollected(msg.sender, feeCollected);

414:     function sweep() public payable nonReentrant {

416:         if (!allowedBridgeSweepers[msg.sender]) {

417:             revert UnauthorizedBridgeSweeper();

466:     function setAllowedBridgeSweeper(address _sweeper, bool _allowed) external onlyOwner {

467:         allowedBridgeSweepers[_sweeper] = _allowed;

469:         emit BridgeSweeperAddressUpdated(_sweeper, _allowed);

489:     function recoverERC20(address _token, uint256 _amount, address _to) external onlyOwner {

532:     function updateSweepBatchSize(uint256 _newBatchSize) external onlyOwner {

533:         if (_newBatchSize < 32 ether) revert InvalidSweepBatchSize(_newBatchSize);

534:         emit SweepBatchSizeUpdated(sweepBatchSize, _newBatchSize);

535:         sweepBatchSize = _newBatchSize;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDepositStorage.sol

44:     mapping(address => bool) public allowedBridgeSweepers;

57:     uint256 public sweepBatchSize;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDepositStorage.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

446:     function recoverTokens(

451:         eigenPod.recoverTokens(tokenList, amountsToWithdraw, recipient);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

254:     function sweepERC20(IERC20 token) external onlyERC20RewardsAdmin {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Errors/Errors.sol

113: error UnauthorizedBridgeSweeper();

131: error InvalidSweepBatchSize(uint256 batchSize);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Errors/Errors.sol)

### <a name="L-23"></a>[L-23] Unsafe ERC20 operation(s)

*Instances (6)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

241:             linkToken.approve(address(linkRouterClient), fees);

295:         payable(_to).transfer(_amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

479:         payable(_to).transfer(_amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

268:             token.approve(address(restakeManager), balance - feeAmount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

303:             payable(msg.sender).transfer(_withdrawRequest.amountToRedeem);

305:             IERC20(_withdrawRequest.collateralToken).transfer(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="L-24"></a>[L-24] Unspecific compiler version pragma

*Instances (5)*:
```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

2: pragma solidity >=0.8.4 <0.9.0;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

### <a name="L-25"></a>[L-25] Upgradeable contract is missing a `__gap[50]` storage variable to allow for new storage variables in later versions
See [this](https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps) link for a description of this storage variable. While some contracts may not currently be sub-classed, adding the variable now protects against forgetting to add it in the future.

*Instances (37)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

19:     ReentrancyGuardUpgradeable,

99:         uint8 decimals = IERC20MetadataUpgradeable(address(_ezETH)).decimals();

103:         decimals = IERC20MetadataUpgradeable(address(_xezETH)).decimals();

107:         decimals = IERC20MetadataUpgradeable(address(_wETH)).decimals();

111:         decimals = IERC20MetadataUpgradeable(address(_linkToken)).decimals();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

11: contract RenzoOracleL2 is Initializable, OwnableUpgradeable, RenzoOracleL2StorageV1 {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

29:     OwnableUpgradeable,

30:     ReentrancyGuardUpgradeable,

105:         uint8 decimals = IERC20MetadataUpgradeable(address(_depositToken)).decimals();

109:         decimals = IERC20MetadataUpgradeable(address(_collateralToken)).decimals();

113:         decimals = IERC20MetadataUpgradeable(address(_xezETH)).decimals();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

18:     ERC20Upgradeable,

19:     OwnableUpgradeable,

21:     ERC20PermitUpgradeable

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

15:     using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

25:     EnumerableSetUpgradeable.AddressSet internal _lockboxRegistryArray;

30:     EnumerableSetUpgradeable.AddressSet internal _xerc20RegistryArray;

155:         bytes memory _creation = type(TransparentUpgradeableProxy).creationCode;

165:         EnumerableSetUpgradeable.add(_xerc20RegistryArray, _xerc20);

198:         bytes memory _creation = type(TransparentUpgradeableProxy).creationCode;

209:         EnumerableSetUpgradeable.add(_lockboxRegistryArray, _lockbox);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol

11: contract OptimismMintableXERC20 is ERC165Upgradeable, XERC20, IOptimismMintableERC20 {

50:     ) public view override(ERC165Upgradeable) returns (bool) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

97:         bytes memory _creation = type(TransparentUpgradeableProxy).creationCode;

107:         EnumerableSetUpgradeable.add(_xerc20RegistryArray, _xerc20);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

19:     ReentrancyGuardUpgradeable,

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

10: contract DepositQueue is Initializable, ReentrancyGuardUpgradeable, DepositQueueStorageV2 {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

16:     ReentrancyGuardUpgradeable,

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

14: contract RoleManager is IRoleManager, AccessControlUpgradeable, RoleManagerStorageV3 {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

19:         IERC20Upgradeable _ezETHToken

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RateProvider/BalancerRateProviderStorage.sol

12:     IERC20Upgradeable public ezETHToken;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProviderStorage.sol)

```solidity
File: contracts/RestakeManager.sol

26: contract RestakeManager is Initializable, ReentrancyGuardUpgradeable, RestakeManagerStorageV2 {

28:     using SafeERC20Upgradeable for IEzEthToken;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

16: contract RewardHandler is Initializable, ReentrancyGuardUpgradeable, RewardHandlerStorageV1 {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

13:     PausableUpgradeable,

14:     ReentrancyGuardUpgradeable,

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthToken.sol

13: contract EzEthToken is Initializable, ERC20Upgradeable, IEzEthToken, EzEthTokenStorageV1 {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthToken.sol)

### <a name="L-26"></a>[L-26] Upgradeable contract not initialized
Upgradeable contracts are initialized via an initializer function rather than by a constructor. Leaving such a contract uninitialized may lead to it being taken over by a malicious user

*Instances (109)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

19:     ReentrancyGuardUpgradeable,

66:         _disableInitializers();

70:     function initialize(

81:     ) public initializer {

99:         uint8 decimals = IERC20MetadataUpgradeable(address(_ezETH)).decimals();

103:         decimals = IERC20MetadataUpgradeable(address(_xezETH)).decimals();

107:         decimals = IERC20MetadataUpgradeable(address(_wETH)).decimals();

111:         decimals = IERC20MetadataUpgradeable(address(_linkToken)).decimals();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

11: contract RenzoOracleL2 is Initializable, OwnableUpgradeable, RenzoOracleL2StorageV1 {

20:         _disableInitializers();

23:     function initialize(AggregatorV3Interface _oracle) public initializer {

25:         __Ownable_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

29:     OwnableUpgradeable,

30:     ReentrancyGuardUpgradeable,

60:         _disableInitializers();

75:     function initialize(

86:     ) public initializer {

88:         __Ownable_init();

105:         uint8 decimals = IERC20MetadataUpgradeable(address(_depositToken)).decimals();

109:         decimals = IERC20MetadataUpgradeable(address(_collateralToken)).decimals();

113:         decimals = IERC20MetadataUpgradeable(address(_xezETH)).decimals();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

18:     ERC20Upgradeable,

19:     OwnableUpgradeable,

21:     ERC20PermitUpgradeable

51:         _disableInitializers();

61:     function initialize(

65:     ) public initializer {

66:         __XERC20_init(_name, _symbol, _factory);

76:     function __XERC20_init(

81:         __ERC20_init(_name, _symbol);

82:         __ERC20Permit_init(_name);

83:         __Ownable_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Factory.sol

15:     using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

25:     EnumerableSetUpgradeable.AddressSet internal _lockboxRegistryArray;

30:     EnumerableSetUpgradeable.AddressSet internal _xerc20RegistryArray;

45:         _disableInitializers();

54:     function initialize(

57:     ) public initializer {

150:         bytes memory initializeBytecode = abi.encodeCall(

151:             XERC20.initialize,

155:         bytes memory _creation = type(TransparentUpgradeableProxy).creationCode;

160:             abi.encode(xerc20Implementation, _proxyAdmin, initializeBytecode)

165:         EnumerableSetUpgradeable.add(_xerc20RegistryArray, _xerc20);

193:         bytes memory initializeBytecode = abi.encodeCall(

194:             XERC20Lockbox.initialize,

198:         bytes memory _creation = type(TransparentUpgradeableProxy).creationCode;

203:             abi.encode(lockboxImplementation, _proxyAdmin, initializeBytecode)

209:         EnumerableSetUpgradeable.add(_lockboxRegistryArray, _lockbox);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Factory.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol

34:         _disableInitializers();

44:     function initialize(address _xerc20, address _erc20, bool _isNative) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20Lockbox.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol

11: contract OptimismMintableXERC20 is ERC165Upgradeable, XERC20, IOptimismMintableERC20 {

25:         _disableInitializers();

35:     function initialize(

41:     ) public initializer {

42:         __ERC165_init();

43:         __XERC20_init(_name, _symbol, _factory);

50:     ) public view override(ERC165Upgradeable) returns (bool) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol

20:         _disableInitializers();

92:         bytes memory initializeBytecode = abi.encodeCall(

93:             OptimismMintableXERC20.initialize,

97:         bytes memory _creation = type(TransparentUpgradeableProxy).creationCode;

102:             abi.encode(xerc20Implementation, _proxyAdmin, initializeBytecode)

107:         EnumerableSetUpgradeable.add(_xerc20RegistryArray, _xerc20);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20Factory.sol)

```solidity
File: contracts/Delegation/OperatorDelegator.sol

19:     ReentrancyGuardUpgradeable,

70:         _disableInitializers();

74:     function initialize(

80:     ) external initializer {

87:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

10: contract DepositQueue is Initializable, ReentrancyGuardUpgradeable, DepositQueueStorageV2 {

70:         _disableInitializers();

74:     function initialize(IRoleManager _roleManager) public initializer {

75:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/Oracle/Binance/WBETHShim.sol

19:         _disableInitializers();

23:     function initialize(IStakedTokenV2 _wBETHToken) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Binance/WBETHShim.sol)

```solidity
File: contracts/Oracle/Mantle/METHShim.sol

19:         _disableInitializers();

23:     function initialize(IMethStaking _methStaking) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/Mantle/METHShim.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

16:     ReentrancyGuardUpgradeable,

40:         _disableInitializers();

44:     function initialize(IRoleManager _roleManager) public initializer {

47:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

```solidity
File: contracts/Permissions/RoleManager.sol

14: contract RoleManager is IRoleManager, AccessControlUpgradeable, RoleManagerStorageV3 {

18:         _disableInitializers();

22:     function initialize(address roleManagerAdmin) public initializer {

25:         __AccessControl_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Permissions/RoleManager.sol)

```solidity
File: contracts/RateProvider/BalancerRateProvider.sol

13:         _disableInitializers();

17:     function initialize(

19:         IERC20Upgradeable _ezETHToken

20:     ) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProvider.sol)

```solidity
File: contracts/RateProvider/BalancerRateProviderStorage.sol

12:     IERC20Upgradeable public ezETHToken;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RateProvider/BalancerRateProviderStorage.sol)

```solidity
File: contracts/RestakeManager.sol

26: contract RestakeManager is Initializable, ReentrancyGuardUpgradeable, RestakeManagerStorageV2 {

28:     using SafeERC20Upgradeable for IEzEthToken;

97:         _disableInitializers();

101:     function initialize(

108:     ) public initializer {

109:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Rewards/RewardHandler.sol

16: contract RewardHandler is Initializable, ReentrancyGuardUpgradeable, RewardHandlerStorageV1 {

34:         _disableInitializers();

38:     function initialize(IRoleManager _roleManager, address _rewardDestination) public initializer {

39:         __ReentrancyGuard_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Rewards/RewardHandler.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

13:     PausableUpgradeable,

14:     ReentrancyGuardUpgradeable,

58:         _disableInitializers();

64:     function initialize(

71:     ) external initializer {

81:         __Pausable_init();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

```solidity
File: contracts/token/EzEthToken.sol

13: contract EzEthToken is Initializable, ERC20Upgradeable, IEzEthToken, EzEthTokenStorageV1 {

29:         _disableInitializers();

33:     function initialize(IRoleManager _roleManager) public initializer {

36:         __ERC20_init("ezETH", "Renzo Restaked ETH");

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/token/EzEthToken.sol)


## Medium Issues


| |Issue|Instances|
|-|:-|:-:|
| [M-1](#M-1) | Contracts are vulnerable to fee-on-transfer accounting-related issues | 6 |
| [M-2](#M-2) | `block.number` means different things on different L2s | 1 |
| [M-3](#M-3) | Centralization Risk for trusted owners | 26 |
| [M-4](#M-4) | `call()` should be used instead of `transfer()` on an `address payable` | 3 |
| [M-5](#M-5) | Fees can be set to be greater than 100%. | 2 |
| [M-6](#M-6) | Chainlink's `latestRoundData` might return stale or incorrect results | 3 |
| [M-7](#M-7) | Missing checks for whether the L2 Sequencer is active | 3 |
| [M-8](#M-8) | Direct `supportsInterface()` calls may cause caller to revert | 2 |
| [M-9](#M-9) | Return values of `transfer()`/`transferFrom()` not checked | 1 |
| [M-10](#M-10) | Unsafe use of `transfer()`/`transferFrom()` with `IERC20` | 1 |
### <a name="M-1"></a>[M-1] Contracts are vulnerable to fee-on-transfer accounting-related issues
Consistently check account balance before and after transfers for Fee-On-Transfer discrepancies. As arbitrary ERC20 tokens can be used, the amount here should be calculated every time to take into consideration a possible fee-on-transfer or deflation.
Also, it's a good practice for the future of the solution.

Use the balance before and after the transfer to calculate the received amount instead of assuming that it would be equal to the amount passed as a parameter. Or explicitly document that such tokens shouldn't be used and won't be supported

*Instances (6)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

151:         token.safeTransferFrom(msg.sender, address(this), tokenAmount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

```solidity
File: contracts/Deposits/DepositQueue.sol

140:         IERC20(_asset).safeTransferFrom(msg.sender, address(this), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Deposits/DepositQueue.sol)

```solidity
File: contracts/RestakeManager.sol

540:         _collateralToken.safeTransferFrom(msg.sender, address(this), _amount);

661:         _token.safeTransferFrom(msg.sender, address(this), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/RestakeManager.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

197:         IERC20(_asset).safeTransferFrom(msg.sender, address(this), _amount);

214:         IERC20(address(ezETH)).safeTransferFrom(msg.sender, address(this), _amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="M-2"></a>[M-2] `block.number` means different things on different L2s
On Optimism, `block.number` is the L2 block number, but on Arbitrum, it's the L1 block number, and `ArbSys(address(100)).arbBlockNumber()` must be used. Furthermore, L2 block numbers often occur much more frequently than L1 block numbers (any may even occur on a per-transaction basis), so using block numbers for timing results in inconsistencies, especially when voting is involved across multiple chains. As of version 4.9, OpenZeppelin has [modified](https://blog.openzeppelin.com/introducing-openzeppelin-contracts-v4.9#governor) their governor code to use a clock rather than block numbers, to avoid these sorts of issues, but this still requires that the project [implement](https://docs.openzeppelin.com/contracts/4.x/governance#token_2) a [clock](https://eips.ethereum.org/EIPS/eip-6372) for each L2.

*Instances (1)*:
```solidity
File: contracts/Delegation/OperatorDelegator.sol

247:             block.number,

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Delegation/OperatorDelegator.sol)

### <a name="M-3"></a>[M-3] Centralization Risk for trusted owners

#### Impact:
Contracts have owners with privileged rights to perform admin tasks and need to be trusted to not perform malicious updates or drain funds.

*Instances (26)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

36:     function setOracleAddress(AggregatorV3Interface _oracleAddress) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol

14: contract Receiver is CCIPReceiver, Ownable, Pausable {

96:     function updateXRenzoBridgeL1(address _newXRenzoBridgeL1) external onlyOwner {

107:     function updateCCIPEthChainSelector(uint64 _newChainSelector) external onlyOwner {

117:     function unPause() external onlyOwner {

125:     function pause() external onlyOwner {

134:     function setRenzoDeposit(address _newXRenzoDeposit) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/CCIPReceiver.sol)

```solidity
File: contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol

10: contract ConnextReceiver is IXReceiver, Ownable, Pausable {

92:     function updateXRenzoBridgeL1(address _newXRenzoBridgeL1) external onlyOwner {

103:     function updateCCIPEthChainSelector(uint32 _newChainDomain) external onlyOwner {

113:     function unPause() external onlyOwner {

121:     function pause() external onlyOwner {

130:     function setRenzoDeposit(address _newXRenzoDeposit) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/PriceFeed/ConnextReceiver.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

320:     function updatePriceByOwner(uint256 price) external onlyOwner {

466:     function setAllowedBridgeSweeper(address _sweeper, bool _allowed) external onlyOwner {

478:     function recoverNative(uint256 _amount, address _to) external onlyOwner {

489:     function recoverERC20(address _token, uint256 _amount, address _to) external onlyOwner {

501:     function setOraclePriceFeed(IRenzoOracleL2 _oracle) external onlyOwner {

511:     function setReceiverPriceFeed(address _receiver) external onlyOwner {

521:     function updateBridgeFeeShare(uint256 _newShare) external onlyOwner {

532:     function updateSweepBatchSize(uint256 _newBatchSize) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Bridge/xERC20/contracts/XERC20.sol

139:     ) external onlyOwner {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/XERC20.sol)

```solidity
File: contracts/TimelockController.sol

25: contract TimelockController is AccessControl, IERC721Receiver, IERC1155Receiver {

241:     ) public virtual onlyRole(PROPOSER_ROLE) {

266:     ) public virtual onlyRole(PROPOSER_ROLE) {

296:     function cancel(bytes32 id) public virtual onlyRole(CANCELLER_ROLE) {

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="M-4"></a>[M-4] `call()` should be used instead of `transfer()` on an `address payable`
The use of the deprecated `transfer()` function for an address may make the transaction fail due to the 2300 gas stipend

*Instances (3)*:
```solidity
File: contracts/Bridge/L1/xRenzoBridge.sol

295:         payable(_to).transfer(_amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L1/xRenzoBridge.sol)

```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

479:         payable(_to).transfer(_amount);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

```solidity
File: contracts/Withdraw/WithdrawQueue.sol

303:             payable(msg.sender).transfer(_withdrawRequest.amountToRedeem);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="M-5"></a>[M-5] Fees can be set to be greater than 100%.
There should be an upper limit to reasonable fees.
A malicious owner can keep the fee rate at zero, but if a large value transfer enters the mempool, the owner can jack the rate up to the maximum and sandwich attack a user.

*Instances (2)*:
```solidity
File: contracts/Bridge/L2/xRenzoDeposit.sol

501:     function setOraclePriceFeed(IRenzoOracleL2 _oracle) external onlyOwner {
             emit OraclePriceFeedUpdated(address(_oracle), address(oracle));
             oracle = _oracle;

511:     function setReceiverPriceFeed(address _receiver) external onlyOwner {
             emit ReceiverPriceFeedUpdated(_receiver, receiver);
             receiver = _receiver;

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/xRenzoDeposit.sol)

### <a name="M-6"></a>[M-6] Chainlink's `latestRoundData` might return stale or incorrect results
- This is a common issue: https://github.com/code-423n4/2022-12-tigris-findings/issues/655, https://code4rena.com/reports/2022-10-inverse#m-17-chainlink-oracle-data-feed-is-not-sufficiently-validated-and-can-return-stale-price, https://app.sherlock.xyz/audits/contests/41#issue-m-12-chainlinks-latestrounddata--return-stale-or-incorrect-result and many more occurrences.

`latestRoundData()` is used to fetch the asset price from a Chainlink aggregator, but it's missing additional validations to ensure that the round is complete. If there is a problem with Chainlink starting a new round and finding consensus on the new value for the oracle (e.g. Chainlink nodes abandon the oracle, chain congestion, vulnerability/attacks on the Chainlink system) consumers of this contract may continue using outdated stale data / stale prices.

More bugs related to chainlink here: [Chainlink Oracle Security Considerations](https://medium.com/cyfrin/chainlink-oracle-defi-attacks-93b6cb6541bf#99af)

*Instances (3)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

51:         (, int256 price, , uint256 timestamp, ) = oracle.latestRoundData();
            if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

75:         (, int256 price, , uint256 timestamp, ) = oracle.latestRoundData();
            if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

92:         (, int256 price, , uint256 timestamp, ) = oracle.latestRoundData();
            if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

### <a name="M-7"></a>[M-7] Missing checks for whether the L2 Sequencer is active
Chainlink recommends that users using price oracles, check whether the Arbitrum Sequencer is [active](https://docs.chain.link/data-feeds/l2-sequencer-feeds#arbitrum). If the sequencer goes down, the Chainlink oracles will have stale prices from before the downtime, until a new L2 OCR transaction goes through. Users who submit their transactions via the [L1 Dealyed Inbox](https://developer.arbitrum.io/tx-lifecycle#1b--or-from-l1-via-the-delayed-inbox) will be able to take advantage of these stale prices. Use a [Chainlink oracle](https://blog.chain.link/how-to-use-chainlink-price-feeds-on-arbitrum/#almost_done!_meet_the_l2_sequencer_health_flag) to determine whether the sequencer is offline or not, and don't allow operations to take place while the sequencer is offline.

*Instances (3)*:
```solidity
File: contracts/Bridge/L2/Oracle/RenzoOracleL2.sol

51:         (, int256 price, , uint256 timestamp, ) = oracle.latestRoundData();
            if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/L2/Oracle/RenzoOracleL2.sol)

```solidity
File: contracts/Oracle/RenzoOracle.sol

75:         (, int256 price, , uint256 timestamp, ) = oracle.latestRoundData();
            if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

92:         (, int256 price, , uint256 timestamp, ) = oracle.latestRoundData();
            if (timestamp < block.timestamp - MAX_TIME_WINDOW) revert OraclePriceExpired();

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Oracle/RenzoOracle.sol)

### <a name="M-8"></a>[M-8] Direct `supportsInterface()` calls may cause caller to revert
Calling `supportsInterface()` on a contract that doesn't implement the ERC-165 standard will result in the call reverting. Even if the caller does support the function, the contract may be malicious and consume all of the transaction's available gas. Call it via a low-level [staticcall()](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f959d7e4e6ee0b022b41e5b644c79369869d8411/contracts/utils/introspection/ERC165Checker.sol#L119), with a fixed amount of gas, and check the return code, or use OpenZeppelin's [`ERC165Checker.supportsInterface()`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f959d7e4e6ee0b022b41e5b644c79369869d8411/contracts/utils/introspection/ERC165Checker.sol#L36-L39).

*Instances (2)*:
```solidity
File: contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol

53:             super.supportsInterface(interfaceId);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Bridge/xERC20/contracts/optimism/OptimismMintableXERC20.sol)

```solidity
File: contracts/TimelockController.sol

147:             super.supportsInterface(interfaceId);

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/TimelockController.sol)

### <a name="M-9"></a>[M-9] Return values of `transfer()`/`transferFrom()` not checked
Not all `IERC20` implementations `revert()` when there's a failure in `transfer()`/`transferFrom()`. The function signature has a `boolean` return value and they indicate errors that way instead. By not checking the return value, operations that should have marked as failed, may potentially go through without actually making a payment

*Instances (1)*:
```solidity
File: contracts/Withdraw/WithdrawQueue.sol

305:             IERC20(_withdrawRequest.collateralToken).transfer(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)

### <a name="M-10"></a>[M-10] Unsafe use of `transfer()`/`transferFrom()` with `IERC20`
Some tokens do not implement the ERC20 standard properly but are still accepted by most code that accepts ERC20 tokens.  For example Tether (USDT)'s `transfer()` and `transferFrom()` functions on L1 do not return booleans as the specification requires, and instead have no return value. When these sorts of tokens are cast to `IERC20`, their [function signatures](https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca) do not match and therefore the calls made, revert (see [this](https://gist.github.com/IllIllI000/2b00a32e8f0559e8f386ea4f1800abc5) link for a test case). Use OpenZeppelin's `SafeERC20`'s `safeTransfer()`/`safeTransferFrom()` instead

*Instances (1)*:
```solidity
File: contracts/Withdraw/WithdrawQueue.sol

305:             IERC20(_withdrawRequest.collateralToken).transfer(

```
[Link to code](https://github.com/code-423n4/2024-04-renzo/blob/main/contracts/Withdraw/WithdrawQueue.sol)
