// map blockchain data to entities outlined in schema.graphql
import {
  MarketListed,
  NewCollateralFactor,
  NewLiquidationIncentive,
  NewPriceOracle,
} from "../types/Comptroller/Comptroller";
import { createBorrow, createDeposit, createLiquidation, createRepay, createWithdraw } from "./helpers";
import { Mint, Redeem, Borrow, RepayBorrow, LiquidateBorrow } from "../types/templates/cToken/CToken";
import { CToken } from "../types/templates";
import { NewReserveFactor } from "../types/Comptroller/cToken";
import { updateFinancials, updateMarketMetrics, updateUsageMetrics } from "../common/metrics";
import { getOrCreateLendingProtcol, getOrCreateMarket } from "../common/getters";
import { exponentToBigDecimal } from "../common/utils/utils";
import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { BIGDECIMAL_ONE, DEFAULT_DECIMALS } from "../common/utils/constants";

export function handleMint(event: Mint): void {
  if (createDeposit(event, event.params.mintAmount, event.params.mintTokens, event.params.minter)) {
    updateUsageMetrics(event, event.params.minter);
    updateFinancials(event);
    updateMarketMetrics(event);
  }
}

export function handleRedeem(event: Redeem): void {
  if (createWithdraw(event, event.params.redeemer, event.params.redeemAmount)) {
    updateUsageMetrics(event, event.params.redeemer);
    updateFinancials(event);
    updateMarketMetrics(event);
  }
}

export function handleBorrow(event: Borrow): void {
  if (createBorrow(event, event.params.borrower, event.params.borrowAmount)) {
    updateUsageMetrics(event, event.params.borrower);
    updateFinancials(event);
    updateMarketMetrics(event);
  }
}

export function handleRepayBorrow(event: RepayBorrow): void {
  if (createRepay(event, event.params.payer, event.params.repayAmount)) {
    updateUsageMetrics(event, event.params.payer);
    updateFinancials(event);
    updateMarketMetrics(event);
  }
}

export function handleLiquidateBorrow(event: LiquidateBorrow): void {
  if (
    createLiquidation(
      event,
      event.params.cTokenCollateral,
      event.params.liquidator,
      event.params.seizeTokens,
      event.params.repayAmount,
    )
  ) {
    updateUsageMetrics(event, event.params.liquidator);
    updateFinancials(event);
    updateMarketMetrics(event);
  }
}

export function handleMarketListed(event: MarketListed): void {
  // create new market now that the data source is instantiated
  CToken.create(event.params.cToken);
  let market = getOrCreateMarket(event, event.params.cToken);
}

export function handleNewPriceOracle(event: NewPriceOracle): void {
  // create LendingProtocol - first function to be called in Comptroller
  let lendingProtocol = getOrCreateLendingProtcol();

  lendingProtocol._priceOracle = event.params.newPriceOracle;
  lendingProtocol.save();
}

export function handleNewReserveFactor(event: NewReserveFactor): void {
  let market = getOrCreateMarket(event, event.address);

  // get reserve factor
  market._reserveFactor = event.params.newReserveFactorMantissa
    .toBigDecimal()
    .div(exponentToBigDecimal(DEFAULT_DECIMALS));
  market.save();
}

export function handleNewCollateralFactor(event: NewCollateralFactor): void {
  let market = getOrCreateMarket(event, event.params.cToken);
  let newLTV = event.params.newCollateralFactorMantissa.toBigDecimal().div(exponentToBigDecimal(16));
  market.maximumLTV = newLTV;
  // collateral factor is the borrowing capacity. The liquidity a borrower has is the collateral factor
  // ex: if collateral factor = 75% and the user has 100 USD (normalized) they can borrow $75
  //     if that ratio rises above 75% they are at risk of liquidation
  market.liquidationThreshold = newLTV;
  market.save();
}

export function handleNewLiquidationIncentive(event: NewLiquidationIncentive): void {
  let protocol = getOrCreateLendingProtcol();
  let liquidationPenalty = event.params.newLiquidationIncentiveMantissa
    .toBigDecimal()
    .div(exponentToBigDecimal(DEFAULT_DECIMALS))
    .minus(BIGDECIMAL_ONE);
  protocol._liquidationPenalty = liquidationPenalty;

  // set liquidation penalty for each market
  for (let i = 0; i < protocol._marketIds.length; i++) {
    let market = getOrCreateMarket(event, Address.fromString(protocol._marketIds[i]));
    market.liquidationPenalty = liquidationPenalty;
    market.save();
  }
}
