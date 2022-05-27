import {Deposit as DepositOld, OldMasterChef, Withdraw as WithdrawOld,EmergencyWithdraw as EmergencyWithdrawOld} from "../../generated/OldMasterChef/OldMasterChef"
import {Deposit, EmergencyWithdraw, MasterChefProxy, Withdraw as Withdraw } from "../../generated/MasterChefProxy/MasterChefProxy"
import { getOrCreateStrategy, getOrCreateToken, getOrCreateVault } from "../common/initializers";
import { Address } from "@graphprotocol/graph-ts";
import { BIGINT_ZERO, UsageType } from "../common/constants";
// import { _Deposit } from "../modules/Deposit";
import { updateFinancials, updateUsageMetrics, updateVaultSnapshots } from "../modules/Metrics";
// import { _Withdraw } from "../modules/Withdraw";
import { handleReward, handleRewardOld } from "../modules/Reward";

export function handleDepositMasterChefOld(event: DepositOld){
    const pid = event.params.pid
    const masterChef = OldMasterChef.bind(event.address)
    const poolInfo = masterChef.try_poolInfo(pid)
    let vaultAddress = null
    let vault = null
    if(!poolInfo.reverted){
         vaultAddress = poolInfo.value.value0;
    }
    if(vaultAddress){
        vault = getOrCreateVault(vaultAddress, event.block);
    }
  
    if (vault) {
      handleRewardOld(event, event.params.pid, event.params.amount, UsageType.DEPOSIT);
        
      // _Deposit(event.transaction.from, event.transaction, event.block, vault,event.params.amount,null);
    }
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
    if(vaultAddress){
        updateVaultSnapshots(vaultAddress, event.block);
    }
}

export function handleDepositMasterChef(event: Deposit){
    const pid = event.params.pid
    const masterChef = MasterChefProxy.bind(event.address)
    const poolInfo = masterChef.try_poolInfo(pid)
    const strategyInfo = masterChef.try_strategies(pid)
    let vaultAddress = null
    let strategyAddress = null
    let vault = null
    if(!poolInfo.reverted){
         vaultAddress = Address.fromBigInt(poolInfo.value.value0);
    }
    if(!strategyInfo.reverted){
        strategyAddress = strategyInfo.value;
        if(vaultAddress){
            getOrCreateStrategy(
                vaultAddress,
                strategyAddress,
            );
        }
    }
    if(vaultAddress){
        vault = getOrCreateVault(vaultAddress, event.block);
    }
  
    if (vault) {
      handleReward(event, event.params.pid, event.params.amount, UsageType.DEPOSIT);

      // _Deposit(event.params.to, event.transaction, event.block, vault,event.params.amount,null);
    }
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
    if(vaultAddress){
        updateVaultSnapshots(vaultAddress, event.block);
    }
}


export function handleWithdrawMasterChefOld(event: WithdrawOld){
   
  const pid = event.params.pid
  const masterChef = OldMasterChef.bind(event.address)
  const poolInfo = masterChef.try_poolInfo(pid)
  let vaultAddress = null
  let vault = null
  if(!poolInfo.reverted){
       vaultAddress = poolInfo.value.value0;
  }
  if(vaultAddress){
      vault = getOrCreateVault(vaultAddress, event.block);
  }

  if (vault) {
    let withdrawAmount = event.params.amount;
    handleRewardOld(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);

    // _Withdraw(
    //   event.transaction.from,
    //   event.transaction,
    //   event.block,
    //   vault,
    //   withdrawAmount,
    //   null
    // );
  }
  updateFinancials(event.block);
  updateUsageMetrics(event.block, event.transaction.from);
  if(vaultAddress){
      updateVaultSnapshots(vaultAddress, event.block);
  }
}


export function handleWithdrawMasterChef(event: Withdraw){
   
    const pid = event.params.pid
    const masterChef = MasterChefProxy.bind(event.address)
    const poolInfo = masterChef.try_poolInfo(pid)
    let vaultAddress = null
    let vault = null
    if(!poolInfo.reverted){
         vaultAddress = poolInfo.value.value0;
    }
    if(vaultAddress){
        vault = getOrCreateVault(Address.fromBigInt(vaultAddress), event.block);
    }
  
    if (vault) {
      let withdrawAmount = event.params.amount;
      handleReward(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  
      // _Withdraw(
      //   event.transaction.from,
      //   event.transaction,
      //   event.block,
      //   vault,
      //   withdrawAmount,
      //   null
      // );
    }
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
    if(vaultAddress){
        updateVaultSnapshots(Address.fromBigInt(vaultAddress), event.block);
    }
}


export function handleEmergencyWithdrawMasterChefOld(event: EmergencyWithdrawOld){
   
    const pid = event.params.pid
    const masterChef = OldMasterChef.bind(event.address)
    const poolInfo = masterChef.try_poolInfo(pid)
    let vaultAddress = null
    let vault = null
    if(!poolInfo.reverted){
         vaultAddress = poolInfo.value.value0;
    }
    if(vaultAddress){
        vault = getOrCreateVault(vaultAddress, event.block);
    }
  
    if (vault) {
      // let withdrawAmount = event.params.amount;
      handleRewardOld(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  
      // _Withdraw(
      //   event.transaction.from,
      //   event.transaction,
      //   event.block,
      //   vault,
      //   withdrawAmount,
      //   null
      // );
    }
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
    if(vaultAddress){
        updateVaultSnapshots(vaultAddress, event.block);
    }
  }

export function handleEmergencyWithdrawMasterChef(event: EmergencyWithdraw){
   
    const pid = event.params.pid
    const masterChef = MasterChefProxy.bind(event.address)
    const poolInfo = masterChef.try_poolInfo(pid)
    let vaultAddress = null
    let vault = null
    if(!poolInfo.reverted){
         vaultAddress = poolInfo.value.value0;
    }
    if(vaultAddress){
        vault = getOrCreateVault(Address.fromBigInt(vaultAddress), event.block);
    }
  
    if (vault) {
      // let withdrawAmount = event.params.amount;
      handleReward(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  
      // _Withdraw(
      //   event.transaction.from,
      //   event.transaction,
      //   event.block,
      //   vault,
      //   withdrawAmount,
      //   null
      // );
    }
    updateFinancials(event.block);
    updateUsageMetrics(event.block, event.transaction.from);
    if(vaultAddress){
        updateVaultSnapshots(Address.fromBigInt(vaultAddress), event.block);
    }
}