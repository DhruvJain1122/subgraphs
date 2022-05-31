import {Deposit as DepositOld, OldMasterChef, Withdraw as WithdrawOld,EmergencyWithdraw as EmergencyWithdrawOld} from "../../generated/OldMasterChef/OldMasterChef"
import {Deposit, EmergencyWithdraw, MasterChefProxy, Withdraw as Withdraw } from "../../generated/MasterChefProxy/MasterChefProxy"
import { getOrCreateStrategy, getOrCreateToken, getOrCreateVault } from "../common/initializers";
import { Address } from "@graphprotocol/graph-ts";
import { BIGINT_ZERO, UsageType, ZERO_ADDRESS } from "../common/constants";
// import { _Deposit } from "../modules/Deposit";
import { updateFinancials, updateUsageMetrics, updateVaultSnapshots } from "../modules/Metrics";
// import { _Withdraw } from "../modules/Withdraw";
import { handleReward, handleRewardOld } from "../modules/Reward";

export function handleDepositMasterChefOld(event: DepositOld): void{
  
    handleRewardOld(event, event.params.pid, event.params.amount, UsageType.DEPOSIT);
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
   
}

export function handleDepositMasterChef(event: Deposit): void{
      handleReward(event, event.params.pid, event.params.amount, UsageType.DEPOSIT);
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);

}


export function handleWithdrawMasterChefOld(event: WithdrawOld): void{
    handleRewardOld(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);

  updateFinancials(event.block);
  updateUsageMetrics(event.block, event.transaction.from);

}


export function handleWithdrawMasterChef(event: Withdraw): void{
      handleReward(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);

    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);

}


export function handleEmergencyWithdrawMasterChefOld(event: EmergencyWithdrawOld): void{
   
      handleRewardOld(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  

    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
 
  }

export function handleEmergencyWithdrawMasterChef(event: EmergencyWithdraw): void{
    handleReward(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);

    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
    
}