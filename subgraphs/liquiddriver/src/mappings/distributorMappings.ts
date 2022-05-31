import { BigInt } from "@graphprotocol/graph-ts"
import {Claimed, Distributor} from "../../generated/DistributorV1/Distributor"
import { BIGDECIMAL_ONE, BIGDECIMAL_ZERO, BIGINT_ONE, BIGINT_TEN, BIGINT_ZERO, DEVELOPER_FEE, PROTOCOL_ID, LARGE_RANDOM_NUMBER, SECONDS_PER_DAY } from "../common/constants"
import { getOrCreateToken, getOrCreateYieldAggregator } from "../common/initializers"
import { updateFinancials, updateUsageMetrics } from "../modules/Metrics"
import { getUsdPricePerToken } from "../Prices"

export function handleClaim(event: Claimed): void{

    const distributorAddress = event.address

    const distributorContract = Distributor.bind(distributorAddress)
    const timeCursor = distributorContract.time_cursor()

    const protocol = getOrCreateYieldAggregator(PROTOCOL_ID)
    
    let oldDistributedTokenUSD = BIGDECIMAL_ZERO
    let newDistributedTokenUSD = BIGDECIMAL_ZERO

    for (let i = 0; i < LARGE_RANDOM_NUMBER; i++) {
        const tokenAddressCall = distributorContract.try_tokens(BigInt.fromI32(i))
        if(tokenAddressCall.reverted){
            break;
        }else{
            const tokenAddr = tokenAddressCall.value
            const token = getOrCreateToken(tokenAddr)
            let startTime =  BIGINT_ZERO
            if(token.lastDistributionDate !== null){
                startTime = token.lastDistributionDate!
            }
            let dailyCounter = startTime.mod(BigInt.fromI32(SECONDS_PER_DAY))
            let lastPriceUSD =  BIGDECIMAL_ZERO
            if(token.lastDistributionUSD !== null){
                lastPriceUSD = token.lastDistributionUSD!
            }
            oldDistributedTokenUSD = oldDistributedTokenUSD.plus(lastPriceUSD)
            let distributedTokens = BIGINT_ZERO
            while (startTime < timeCursor) {
                const tokensPerDayCall = distributorContract.try_tokens_per_day(startTime,BigInt.fromI32(i))
                const tokenPerDay = tokensPerDayCall.reverted ? tokensPerDayCall.value: BIGINT_ZERO
                
                distributedTokens = distributedTokens.plus(tokenPerDay)
               
                startTime = startTime.plus(BigInt.fromI32(SECONDS_PER_DAY))
                dailyCounter = dailyCounter.plus(BIGINT_ONE)
            }
            let tokenPrice = getUsdPricePerToken(tokenAddr);
            let tokenDecimals = BIGINT_TEN.pow(token.decimals as u8);
          
            const distributedTokensUSD = tokenPrice.usdPrice
              .times(distributedTokens.toBigDecimal())
              .div(tokenDecimals.toBigDecimal())
              .div(tokenPrice.decimalsBaseTen);


            lastPriceUSD = lastPriceUSD.plus(distributedTokensUSD)
            newDistributedTokenUSD = newDistributedTokenUSD.plus(lastPriceUSD)

            token.lastDistributionDate = timeCursor
            token.lastDistributionUSD = lastPriceUSD
            token.save()
        }
    }

    
    const newValue = newDistributedTokenUSD.minus(oldDistributedTokenUSD)
    protocol.cumulativeTotalRevenueUSD = protocol.cumulativeTotalRevenueUSD.plus(newValue)
    protocol.cumulativeProtocolSideRevenueUSD = protocol.cumulativeProtocolSideRevenueUSD.plus(newValue.times(DEVELOPER_FEE))
    protocol.cumulativeSupplySideRevenueUSD = protocol.cumulativeSupplySideRevenueUSD.plus(newValue.times(BIGDECIMAL_ONE.minus(DEVELOPER_FEE)))
    protocol.save()

    updateFinancials(event.block)
    updateUsageMetrics(event.block, event.transaction.from);
}
