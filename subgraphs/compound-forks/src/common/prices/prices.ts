import {
  COMPTROLLER_ADDRESS,

  BIGDECIMAL_ZERO,
  CREAM_COMPTROLLER_ADDRESS,

} from "../../common/utils/constants";
import { Market } from "../../types/schema";
import {  BigDecimal } from "@graphprotocol/graph-ts";
import {getUSDPriceOfToken as getUSDPriceOfTokenCompound} from './compound/prices'
import {getUSDPriceOfToken as getUSDPriceOfTokenCream} from './cream/prices'

// returns the token price
export function getUSDPriceOfToken(market: Market, blockNumber: i32, protocolAddress : string): BigDecimal {
  let tokenPrice = BIGDECIMAL_ZERO
  switch(protocolAddress.toLowerCase()){
    case COMPTROLLER_ADDRESS.toLowerCase():
      tokenPrice = getUSDPriceOfTokenCompound(market,blockNumber)
      break
    case CREAM_COMPTROLLER_ADDRESS.toLowerCase():
      tokenPrice = getUSDPriceOfTokenCream(market,blockNumber)
      break
  }
  return tokenPrice;
}