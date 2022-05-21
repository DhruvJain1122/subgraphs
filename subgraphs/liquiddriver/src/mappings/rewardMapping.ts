
export function handleDeposit(event: DepositEvent): void {
    handleReward(event, event.params.pid, event.params.amount, UsageType.DEPOSIT);
  }
  
  export function handleWithdraw(event: WithdrawEvent): void {
    handleReward(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  }
  
  export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
    handleReward(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  }
  
  export function handleDepositV2(event: DepositEventV2): void {
    handleRewardV2(event, event.params.pid, event.params.amount, UsageType.DEPOSIT);
  }
  
  export function handleWithdrawV2(event: WithdrawEventV2): void {
    handleRewardV2(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  }
  
  export function handleEmergencyWithdrawV2(event: EmergencyWithdrawV2): void {
    handleRewardV2(event, event.params.pid, event.params.amount, UsageType.WITHDRAW);
  }
  