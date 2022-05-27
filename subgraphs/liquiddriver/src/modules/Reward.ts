import { Address, BigDecimal, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
// import { NetworkConfigs } from "../../../../config/configure";
import { OldMasterChef } from "../../generated/OldMasterChef/OldMasterChef";
import { SPIRITMasterChef } from "../../generated/SPIRIT_STAKING/SPIRITMasterChef";
import { HNDMasterChef } from "../../generated/SPIRIT_STAKING/HNDMasterChef";
import { MasterChefProxy } from "../../generated/MasterChefProxy/MasterChefProxy";
import { Vault, _HelperStore } from "../../generated/schema";
import { BIGDECIMAL_ONE, BIGINT_FIVE, BIGINT_ONE, BIGINT_ZERO, HND_ADDRESS, INT_ZERO, SPIRIT_ADDRESS, UsageType, ZERO_ADDRESS } from "../common/constants";
import { getOrCreateShadowVault, getOrCreateToken } from "../common/initializers";
import { getRewardsPerDay, RewardIntervalType } from "../common/rewards";
import { getOrCreateVault } from "../common/initializers";
import { getUsdPrice, getUsdPricePerToken } from "../Prices";

export function handleRewardOld(event: ethereum.Event, pid: BigInt, amount: BigInt, usageType: string): void {
  let masterChefPool = _HelperStore.load(event.address.toHexString() + "-" + pid.toString());
  let poolContract = OldMasterChef.bind(event.address);

  // Create entity to track masterchef pool mappings
  if (!masterChefPool) {
    masterChefPool = new _HelperStore(event.address.toHexString() + "-" + pid.toString());
    let poolInfo = poolContract.try_poolInfo(pid);
    let lpTokenAddress = ZERO_ADDRESS.toHexString();
    if (!poolInfo.reverted) {
      lpTokenAddress = poolInfo.value.value1.toHexString();
    }
    masterChefPool.valueString = lpTokenAddress;
    masterChefPool.valueBigInt = BIGINT_ZERO;
    masterChefPool.save();
  }

  let pool = getOrCreateVault(Address.fromString(masterChefPool.valueString!), event.block);
  if (!pool) {
    return;
  }

  // Update staked amounts
  if (usageType == UsageType.DEPOSIT) {
    pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.plus(amount);
  } else {
    pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.minus(amount);
  }

  // Return if you have calculated rewards recently
  if (event.block.number.minus(masterChefPool.valueBigInt!).lt(BIGINT_FIVE)) {
    pool.save();
    return;
  }

  // Get necessary values from the master chef contract to calculate rewards
  let getPoolInfo = poolContract.try_poolInfo(pid);
  let poolAllocPoint: BigInt = BIGINT_ZERO;
  let lastRewardBlock: BigInt = BIGINT_ZERO;
  if (!getPoolInfo.reverted) {
    let poolInfo = getPoolInfo.value;
    poolAllocPoint = poolInfo.value1;
    lastRewardBlock = poolInfo.value2;
  }

  let getRewardTokenPerBlock = poolContract.try_lqdrPerBlock();
  let rewardTokenPerBlock: BigInt = BIGINT_ZERO;
  if (!getRewardTokenPerBlock.reverted) {
    rewardTokenPerBlock = getRewardTokenPerBlock.value;
  }

  let getMultiplier = poolContract.try_getMultiplier(lastRewardBlock, event.block.number);

  let multiplier: BigInt = BIGINT_ONE;
  if (!getMultiplier.reverted) {
    multiplier = getMultiplier.value;
  }

  let getTotalAllocPoint = poolContract.try_totalAllocPoint();
  let totalAllocPoint: BigInt = BIGINT_ZERO;
  if (!getTotalAllocPoint.reverted) {
    totalAllocPoint = getTotalAllocPoint.value;
  }

  log.warning("multiplier: " + multiplier.toString(), []);
  log.warning("rewardTokenPerBlock: " + rewardTokenPerBlock.toString(), []);
  log.warning("poolAllocPoint: " + poolAllocPoint.toString(), []);
  log.warning("totalAllocPoint: " + totalAllocPoint.toString(), []);

  // Calculate Reward Emission per Block
  let rewardTokenRate = multiplier
    .times(rewardTokenPerBlock)
    .times(poolAllocPoint)
    .div(totalAllocPoint);

  let rewardTokenRateBigDecimal = BigDecimal.fromString(rewardTokenRate.toString());
  let rewardTokenPerDay = getRewardsPerDay(event.block.timestamp, event.block.number, rewardTokenRateBigDecimal, RewardIntervalType.BLOCK);


  let rewardToken = getOrCreateToken(Address.fromString(pool.rewardTokens![INT_ZERO]));

  rewardToken.lastPriceUSD = getUsdPrice(Address.fromString(rewardToken.id),BIGDECIMAL_ONE);

  pool.rewardTokenEmissionsAmount = [BigInt.fromString(rewardTokenPerDay.toString())];
  pool.rewardTokenEmissionsUSD = [rewardTokenPerDay.times(rewardToken.lastPriceUSD!)];

  masterChefPool.valueBigInt = event.block.number;

  masterChefPool.save();
  rewardToken.save();
  pool.save();
}


export function handleReward(event: ethereum.Event, pid: BigInt, amount: BigInt, usageType: string): void {
    let masterChefPool = _HelperStore.load(event.address.toHexString() + "-" + pid.toString());
    let poolContract = MasterChefProxy.bind(event.address);
  
    // Create entity to track masterchef pool mappings
    if (!masterChefPool) {
      masterChefPool = new _HelperStore(event.address.toHexString() + "-" + pid.toString());
      let getlpAddress = poolContract.try_lpToken(pid);
      let lpTokenAddress = ZERO_ADDRESS.toHexString();
      if (!getlpAddress.reverted) {
        lpTokenAddress = getlpAddress.value.toHexString();
      }
      masterChefPool.valueString = lpTokenAddress;
      masterChefPool.valueBigInt = BIGINT_ZERO;
      masterChefPool.save();
    }
  
    let pool = getOrCreateVault(Address.fromString(masterChefPool.valueString!), event.block);
    if (!pool) {
      return;
    }
  
    // Update staked amounts
    if (usageType == UsageType.DEPOSIT) {
      pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.plus(amount);
    } else {
      pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.minus(amount);
    }
  
    // Return if you have calculated rewards recently
    if (event.block.number.minus(masterChefPool.valueBigInt!).lt(BIGINT_FIVE)) {
      pool.save();
      return;
    }

  // Get necessary values from the master chef contract to calculate rewards
  let getRewardTokenPerBlock = poolContract.try_lqdrPerBlock();
  let rewardTokenPerBlock: BigInt = BIGINT_ZERO;
  if (!getRewardTokenPerBlock.reverted) {
    rewardTokenPerBlock = getRewardTokenPerBlock.value;
  }

  let getTotalAllocPoint = poolContract.try_totalAllocPoint();
  let totalAllocPoint: BigInt = BIGINT_ZERO;
  if (!getTotalAllocPoint.reverted) {
    totalAllocPoint = getTotalAllocPoint.value;
  }

  let getPoolInfo = poolContract.try_poolInfo(pid);
  let poolAllocPoint: BigInt = BIGINT_ZERO;
  let lastRewardTime: BigInt = BIGINT_ZERO;
  if (!getPoolInfo.reverted) {
    let poolInfo = getPoolInfo.value;
    poolAllocPoint = poolInfo.value2;
    lastRewardTime = poolInfo.value1;
  }

  // Calculate Reward Emission per sec
  // let time = event.block.timestamp.minus(lastRewardTime);
  let rewardTokenRate = rewardTokenPerBlock.times(poolAllocPoint).div(totalAllocPoint);

  // Get the estimated rewards emitted for the upcoming day for this pool
  let rewardTokenRateBigDecimal = BigDecimal.fromString(rewardTokenRate.toString());
  let rewardTokenPerDay = getRewardsPerDay(event.block.timestamp, event.block.number, rewardTokenRateBigDecimal, RewardIntervalType.TIMESTAMP);


  let rewardToken = getOrCreateToken(Address.fromString(pool.rewardTokens![INT_ZERO]));
 rewardToken.lastPriceUSD = getUsdPrice(Address.fromString(rewardToken.id),BIGDECIMAL_ONE);


  pool.rewardTokenEmissionsAmount = [BigInt.fromString(rewardTokenPerDay.truncate(0).toString())];

  pool.rewardTokenEmissionsUSD = [rewardTokenPerDay.times(rewardToken.lastPriceUSD!)];

  masterChefPool.valueBigInt = event.block.number;
    masterChefPool.save();
    rewardToken.save();
    pool.save();
}
  
  
export function handleShadowFarmsReward(event: ethereum.Event,pid: BigInt, amount: BigInt, usageType: string): void {
  let masterChefPool = _HelperStore.load(event.address.toHexString() + "-" + pid.toString());
  let poolContract = MasterChefProxy.bind(event.address);
  // Create entity to track masterchef pool mappings
  if (!masterChefPool) {
    masterChefPool = new _HelperStore(event.address.toHexString() + "-" + pid.toString());
    let getlpAddress = poolContract.try_lpToken(pid);
    let lpTokenAddress = ZERO_ADDRESS.toHexString();
    if (!getlpAddress.reverted) {
      lpTokenAddress = getlpAddress.value.toHexString();
    }
    masterChefPool.valueString = lpTokenAddress;
    masterChefPool.valueBigInt = BIGINT_ZERO;
    masterChefPool.save();
  }

  let pool = getOrCreateShadowVault(Address.fromString(masterChefPool.valueString!), event.block);
  if (!pool) {
    return;
  }

  // Update staked amounts
  if (usageType == UsageType.DEPOSIT) {
    pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.plus(amount);
  } else {
    pool.stakedOutputTokenAmount = pool.stakedOutputTokenAmount!.minus(amount);
  }

  // Return if you have calculated rewards recently
  if (event.block.number.minus(masterChefPool.valueBigInt!).lt(BIGINT_FIVE)) {
    pool.save();
    return;
  }
  const rewardTokenString = pool.rewardTokens![INT_ZERO]
  let getRewardTokenPerSecond = poolContract.try_lqdrPerBlock();

  // Get necessary values from the master chef contract to calculate rewards
  if(rewardTokenString.toLowerCase() === SPIRIT_ADDRESS.toLowerCase()){
    const spiritPoolContract = SPIRITMasterChef.bind(event.address)
    getRewardTokenPerSecond = spiritPoolContract.try_spiritPerSecond()
  }else if(rewardTokenString.toLowerCase() === HND_ADDRESS.toLowerCase()){
    const hndPoolContract = HNDMasterChef.bind(event.address)
    getRewardTokenPerSecond = hndPoolContract.try_rewardPerSecond()
  }
  
  let rewardTokenPerSecond: BigInt = BIGINT_ZERO;
  if (!getRewardTokenPerSecond.reverted) {
    rewardTokenPerSecond = getRewardTokenPerSecond.value;
  }

  let getTotalAllocPoint = poolContract.try_totalAllocPoint();
  let totalAllocPoint: BigInt = BIGINT_ZERO;
  if (!getTotalAllocPoint.reverted) {
    totalAllocPoint = getTotalAllocPoint.value;
  }

  let getPoolInfo = poolContract.try_poolInfo(pid);
  let poolAllocPoint: BigInt = BIGINT_ZERO;
  let lastRewardTime: BigInt = BIGINT_ZERO;
  if (!getPoolInfo.reverted) {
    let poolInfo = getPoolInfo.value;
    poolAllocPoint = poolInfo.value2;
    lastRewardTime = poolInfo.value1;
  }

  // Calculate Reward Emission per sec
  // let time = event.block.timestamp.minus(lastRewardTime);
  let rewardTokenRate = rewardTokenPerSecond.times(poolAllocPoint).div(totalAllocPoint);

  // Get the estimated rewards emitted for the upcoming day for this pool
  let rewardTokenRateBigDecimal = BigDecimal.fromString(rewardTokenRate.toString());
  let rewardTokenPerDay = getRewardsPerDay(event.block.timestamp, event.block.number, rewardTokenRateBigDecimal, RewardIntervalType.TIMESTAMP);


  let rewardToken = getOrCreateToken(Address.fromString(rewardTokenString));
  rewardToken.lastPriceUSD = getUsdPrice(Address.fromString(rewardToken.id),BIGDECIMAL_ONE);

  pool.rewardTokenEmissionsAmount = [BigInt.fromString(rewardTokenPerDay.truncate(0).toString())];

  pool.rewardTokenEmissionsUSD = [rewardTokenPerDay.times(rewardToken.lastPriceUSD!)];

  masterChefPool.valueBigInt = event.block.number;

  masterChefPool.save();
  rewardToken.save();
  pool.save();
}
