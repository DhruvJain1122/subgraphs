import {
  Token,
  Account,
  _Strategy,
  YieldAggregator,
  VaultDailySnapshot,
  VaultHourlySnapshot,
  FinancialsDailySnapshot,
  UsageMetricsDailySnapshot,
  UsageMetricsHourlySnapshot,
} from "../../generated/schema";
import * as utils from "./utils";
import * as constants from "./constants";
import { enumToPrefix } from "./strings";
import { Vault as VaultStore } from "../../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Vault as VaultContract } from "../../generated/Registry_v1/Vault";
import { ERC20 as ERC20Contract } from "../../generated/Registry_v1/ERC20";
import { MasterChefProxy } from "../../generated/MasterChefProxy/MasterChefProxy";

export function getOrCreateStrategy(
  vaultAddress: Address,
  _strategyAddress: Address
): _Strategy {
  let strategy = _Strategy.load(_strategyAddress.toHexString());

  if (!strategy) {
    strategy = new _Strategy(_strategyAddress.toHexString());
    strategy.vaultAddress = vaultAddress;
  }
  return strategy;
}

export function getOrCreateAccount(id: string): Account {
  let account = Account.load(id);

  if (!account) {
    account = new Account(id);
    account.save();

    const protocol = getOrCreateYieldAggregator(constants.ETHEREUM_PROTOCOL_ID);
    protocol.cumulativeUniqueUsers += 1;
    protocol.save();
  }

  return account;
}

export function getOrCreateYieldAggregator(id: string): YieldAggregator {
  let protocol = YieldAggregator.load(id);

  if (!protocol) {
    protocol = new YieldAggregator(constants.ETHEREUM_PROTOCOL_ID);
    protocol.name = "Liquiddriver";
    protocol.slug = "liquiddriver";
    protocol.schemaVersion = "1.2.1";
    protocol.subgraphVersion = "1.0.0";
    protocol.methodologyVersion = "1.0.0";
    protocol.network = constants.Network.MAINNET;
    protocol.type = constants.ProtocolType.YIELD;

    //////// Quantitative Data ////////
    protocol.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    protocol.protocolControlledValueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    protocol.cumulativeUniqueUsers = 0;

    protocol._vaultIds = [];
  }

  return protocol;
}

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());

  if (!token) {
    token = new Token(address.toHexString());

    const contract = ERC20Contract.bind(address);

    token.name = utils.readValue<string>(contract.try_name(), "");
    token.symbol = utils.readValue<string>(contract.try_symbol(), "");
    token.decimals = utils
      .readValue<BigInt>(contract.try_decimals(), constants.BIGINT_ZERO)
      .toI32() as u8;

    token.save();
  }

  return token;
}

export function getOrCreateFinancialDailySnapshots(
  block: ethereum.Block
): FinancialsDailySnapshot {
  let id = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
  let financialMetrics = FinancialsDailySnapshot.load(id.toString());

  if (!financialMetrics) {
    financialMetrics = new FinancialsDailySnapshot(id.toString());
    financialMetrics.protocol = constants.ETHEREUM_PROTOCOL_ID;

    financialMetrics.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.protocolControlledValueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.dailySupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.dailyProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeProtocolSideRevenueUSD =
      constants.BIGDECIMAL_ZERO;

    financialMetrics.dailyTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    financialMetrics.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;

    financialMetrics.blockNumber = block.number;
    financialMetrics.timestamp = block.timestamp;

    financialMetrics.save();
  }

  return financialMetrics;
}

export function getOrCreateUsageMetricsDailySnapshot(
  block: ethereum.Block
): UsageMetricsDailySnapshot {
  let id: i64 = block.timestamp.toI64() / constants.SECONDS_PER_DAY;
  let usageMetrics = UsageMetricsDailySnapshot.load(id.toString());

  if (!usageMetrics) {
    usageMetrics = new UsageMetricsDailySnapshot(id.toString());
    usageMetrics.protocol = constants.ETHEREUM_PROTOCOL_ID;

    usageMetrics.dailyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.dailyTransactionCount = 0;
    usageMetrics.dailyDepositCount = 0;
    usageMetrics.dailyWithdrawCount = 0;

    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;

    usageMetrics.save();
  }

  return usageMetrics;
}

export function getOrCreateUsageMetricsHourlySnapshot(
  block: ethereum.Block
): UsageMetricsHourlySnapshot {
  let metricsID: string = (block.timestamp.toI64() / constants.SECONDS_PER_DAY)
    .toString()
    .concat("-")
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString());
  let usageMetrics = UsageMetricsHourlySnapshot.load(metricsID);

  if (!usageMetrics) {
    usageMetrics = new UsageMetricsHourlySnapshot(metricsID);
    usageMetrics.protocol = constants.ETHEREUM_PROTOCOL_ID;

    usageMetrics.hourlyActiveUsers = 0;
    usageMetrics.cumulativeUniqueUsers = 0;
    usageMetrics.hourlyTransactionCount = 0;
    usageMetrics.hourlyDepositCount = 0;
    usageMetrics.hourlyWithdrawCount = 0;

    usageMetrics.blockNumber = block.number;
    usageMetrics.timestamp = block.timestamp;

    usageMetrics.save();
  }

  return usageMetrics;
}

export function getOrCreateVaultsDailySnapshots(
  vaultAddress: Address,
  block: ethereum.Block
): VaultDailySnapshot {
  let id: string = vaultAddress
    .toHexString()
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString());
  let vaultSnapshots = VaultDailySnapshot.load(id);

  if (!vaultSnapshots) {
    vaultSnapshots = new VaultDailySnapshot(id);
    vaultSnapshots.protocol = constants.ETHEREUM_PROTOCOL_ID;
    vaultSnapshots.vault = vaultAddress.toHexString();

    vaultSnapshots.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.inputTokenBalance = constants.BIGINT_ZERO;
    vaultSnapshots.outputTokenSupply = constants.BIGINT_ZERO;
    vaultSnapshots.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.pricePerShare = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.stakedOutputTokenAmount = constants.BIGINT_ZERO;
    vaultSnapshots.rewardTokenEmissionsAmount = [constants.BIGINT_ZERO];
    vaultSnapshots.rewardTokenEmissionsUSD = [constants.BIGDECIMAL_ZERO];

    vaultSnapshots.blockNumber = block.number;
    vaultSnapshots.timestamp = block.timestamp;

    vaultSnapshots.save();
  }

  return vaultSnapshots;
}

export function getOrCreateVaultsHourlySnapshots(
  vaultAddress: Address,
  block: ethereum.Block
): VaultHourlySnapshot {
  let id: string = vaultAddress
    .toHexString()
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_DAY).toString())
    .concat("-")
    .concat((block.timestamp.toI64() / constants.SECONDS_PER_HOUR).toString());
  let vaultSnapshots = VaultHourlySnapshot.load(id);

  if (!vaultSnapshots) {
    vaultSnapshots = new VaultHourlySnapshot(id);
    vaultSnapshots.protocol = constants.ETHEREUM_PROTOCOL_ID;
    vaultSnapshots.vault = vaultAddress.toHexString();

    vaultSnapshots.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.inputTokenBalance = constants.BIGINT_ZERO;
    vaultSnapshots.outputTokenSupply = constants.BIGINT_ZERO;
    vaultSnapshots.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.pricePerShare = constants.BIGDECIMAL_ZERO;
    vaultSnapshots.stakedOutputTokenAmount = constants.BIGINT_ZERO;
    vaultSnapshots.rewardTokenEmissionsAmount = [constants.BIGINT_ZERO];
    vaultSnapshots.rewardTokenEmissionsUSD = [constants.BIGDECIMAL_ZERO];

    vaultSnapshots.blockNumber = block.number;
    vaultSnapshots.timestamp = block.timestamp;

    vaultSnapshots.save();
  }

  return vaultSnapshots;
}

export function getOrCreateVault(
  vaultAddress: Address,
  block: ethereum.Block
): VaultStore {
  const vaultAddressString = vaultAddress.toHexString();
  const vaultContract = ERC20Contract.bind(vaultAddress);

  let vault = VaultStore.load(vaultAddressString);

  if (!vault) {
    vault = new VaultStore(vaultAddressString);

    vault.name = utils.readValue<string>(vaultContract.try_name(), "");
    vault.symbol = utils.readValue<string>(vaultContract.try_symbol(), "");
    vault.protocol = constants.ETHEREUM_PROTOCOL_ID;
  

    const rewardToken = getOrCreateToken(Address.fromString(constants.LQDR_ADDRESS));
    vault.rewardTokens = [rewardToken.id]
    vault.inputTokenBalance = constants.BIGINT_ZERO;

    // vault.outputToken = outputToken.id;
    vault.outputTokenSupply = constants.BIGINT_ZERO;

    vault.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    vault.pricePerShare = constants.BIGDECIMAL_ZERO;

    vault.createdBlockNumber = block.number;
    vault.createdTimestamp = block.timestamp;

    vault.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;


    vault.save();
  }

  return vault;
}

export function getOrCreateShadowVault(
  vaultAddress: Address,
  block: ethereum.Block
): VaultStore {
  const vaultAddressString = vaultAddress.toHexString();
  const vaultContract = MasterChefProxy.bind(vaultAddress);
  const lpTokenCall = vaultContract.try_lpToken(constants.BIGINT_ZERO);
  let lpTokenAddress = null
  if(!lpTokenCall.reverted){
      lpTokenAddress = lpTokenCall.value
  }
  let vault = VaultStore.load(vaultAddressString);

  if (!vault) {
    vault = new VaultStore(vaultAddressString);


    const rewardToken = getOrCreateToken(Address.fromString(constants.ShadowTokensUnderlying[lpTokenAddress!.toHexString().toLowerCase()]));
    vault.rewardTokens = [rewardToken.id]
    vault.protocol = constants.ETHEREUM_PROTOCOL_ID;
  

    vault.inputTokenBalance = constants.BIGINT_ZERO;

    vault.outputTokenSupply = constants.BIGINT_ZERO;

    vault.outputTokenPriceUSD = constants.BIGDECIMAL_ZERO;
    vault.pricePerShare = constants.BIGDECIMAL_ZERO;

    vault.createdBlockNumber = block.number;
    vault.createdTimestamp = block.timestamp;

    vault.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;


    vault.save();
  }

  return vault;
}
