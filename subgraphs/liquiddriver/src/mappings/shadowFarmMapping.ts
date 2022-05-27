import {Deposit, EmergencyWithdraw, Withdraw} from "../../generated/SPIRIT_STAKING/ShadowStaking"
import {ERC20} from "../../generated/SPIRIT_STAKING/ERC20"
import { getOrCreateShadowVault, getOrCreateToken, getOrCreateVault, getOrCreateYieldAggregator } from "../common/initializers";
import { updateFinancials, updateUsageMetrics, updateVaultSnapshots } from "../modules/Metrics";
import { Address } from "@graphprotocol/graph-ts";
import { BIGINT_TEN, ETHEREUM_PROTOCOL_ID, ShadowTokensUnderlying, UsageType } from "../common/constants";
import { getUsdPricePerToken } from "../Prices";
import { Vault } from "../../generated/schema";
import { handleShadowFarmsReward } from "../modules/Reward";

export function handleDeposit(event: Deposit): void{
    const vaultAddress = event.address
    const vault = getOrCreateShadowVault(vaultAddress, event.block);

    if (vault) {
      // _Deposit(event.params.to, event.transaction, event.block, vault,event.params.amount,null);
      handleShadowFarmsReward(event, event.params.pid, event.params.amount, UsageType.DEPOSIT);
    }
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
    updateVaultSnapshots(vaultAddress, event.block);

    const lpTokenAddress = Address.fromString(vault.inputToken)
    updateControlledValue(lpTokenAddress, vault)
}

export function handleWithdraw(event: Withdraw): void{
    const vaultAddress = event.address
    const vault = getOrCreateShadowVault(vaultAddress, event.block);

    if (vault) {
      // _Deposit(event.params.to, event.transaction, event.block, vault,event.params.amount,null);
      handleShadowFarmsReward(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
    }
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
    updateVaultSnapshots(vaultAddress, event.block);

    const lpTokenAddress = Address.fromString(vault.inputToken)
    updateControlledValue(lpTokenAddress, vault)
}
export function handleEmergencyWithdraw(event: EmergencyWithdraw): void{
  const vaultAddress = event.address
  const vault = getOrCreateShadowVault(vaultAddress, event.block);

  if (vault) {
    // _Deposit(event.params.to, event.transaction, event.block, vault,event.params.amount,null);
    handleShadowFarmsReward(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  }
  updateFinancials(event.block);
  updateUsageMetrics(event.block, event.transaction.from);
  updateVaultSnapshots(vaultAddress, event.block);

  const lpTokenAddress = Address.fromString(vault.inputToken)
  updateControlledValue(lpTokenAddress, vault)
}

function updateControlledValue(lpTokenAddress: Address, vault: Vault):void{
    const lpToken = getOrCreateToken(lpTokenAddress)
    const lpTokenContract = ERC20.bind(lpTokenAddress)
    const totalSupplyCall = lpTokenContract.try_totalSupply()
    if(!totalSupplyCall.reverted){
        const totalSupply = totalSupplyCall.value;
        const protocol = getOrCreateYieldAggregator(ETHEREUM_PROTOCOL_ID)

        const controlledValueUSD = vault.controlledValueUSD

        const inputTokenAddress = Address.fromString(ShadowTokensUnderlying[vault.inputToken.toLowerCase()])
        let inputTokenPrice = getUsdPricePerToken(inputTokenAddress);
        let lpTokenDecimals = BIGINT_TEN.pow(lpToken!.decimals as u8);
      
        vault.controlledValueUSD = inputTokenPrice.usdPrice
          .times(totalSupply.toBigDecimal())
          .div(lpTokenDecimals.toBigDecimal())
          .div(inputTokenPrice.decimalsBaseTen);

        vault.save()
        
        protocol.protocolControlledValueUSD = protocol.protocolControlledValueUSD!.minus(controlledValueUSD!).plus(vault.controlledValueUSD)
       
        protocol.save()
        
    }
}