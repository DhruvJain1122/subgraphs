import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";


// The network names corresponding to the Network enum in the schema.
// They also correspond to the ones in `dataSource.network()` after converting to lower case.
// See below for a complete list:
// https://thegraph.com/docs/en/hosted-service/what-is-hosted-service/#supported-networks-on-the-hosted-service
export namespace Network {
  export const ARBITRUM_ONE = "ARBITRUM_ONE";
  export const AVALANCHE = "AVALANCHE";
  export const AURORA = "AURORA";
  export const BSC = "BSC"; // aka BNB Chain
  export const CELO = "CELO";
  export const MAINNET = "MAINNET"; // Ethereum mainnet
  export const FANTOM = "FANTOM";
  export const FUSE = "FUSE";
  export const MOONBEAM = "MOONBEAM";
  export const MOONRIVER = "MOONRIVER";
  export const NEAR_MAINNET = "NEAR_MAINNET";
  export const OPTIMISM = "OPTIMISM";
  export const MATIC = "MATIC"; // aka Polygon
  export const XDAI = "XDAI"; // aka Gnosis Chain
}

export namespace ProtocolType {
  export const EXCHANGE = "EXCHANGE";
  export const LENDING = "LENDING";
  export const YIELD = "YIELD";
  export const BRIDGE = "BRIDGE";
  export const GENERIC = "GENERIC";
}

export namespace VaultFeeType {
  export const MANAGEMENT_FEE = "MANAGEMENT_FEE";
  export const PERFORMANCE_FEE = "PERFORMANCE_FEE";
  export const DEPOSIT_FEE = "DEPOSIT_FEE";
  export const WITHDRAWAL_FEE = "WITHDRAWAL_FEE";
}

export namespace RewardTokenType {
  export const DEPOSIT = "DEPOSIT";
  export const BORROW = "BORROW";
}
export namespace UsageType {
  export const DEPOSIT = "DEPOSIT";
  export const WITHDRAW = "WITHDRAW";
}

export const VAULT_VERSION_0_3_0 = '0.3.0'
export const VAULT_VERSION_0_3_2 = '0.3.2'
export const VAULT_VERSION_0_3_3 = '0.3.3'
export const VAULT_VERSION_0_3_5 = '0.3.5'
export const VAULT_VERSION_LATEST = '0.4.3'

export const MAX_BPS = BigInt.fromI32(10000);
export const SECONDS_PER_YEAR = BigInt.fromI32(31557600);
export const SECONDS_PER_YEAR_EXACT = BigInt.fromI32(31556952);

export const SECONDS_PER_HOUR = 60 * 60;
export const SECONDS_PER_DAY = 60 * 60 * 24;

export const DEFAULT_MANAGEMENT_FEE = BigInt.fromI32(200);
export const DEFAULT_PERFORMANCE_FEE = BigInt.fromI32(2000);
export const DEFAULT_WITHDRAWAL_FEE = BigInt.fromI32(50);

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);
export const BIGINT_FIVE = BigInt.fromI32(5);
export const BIGINT_TEN = BigInt.fromI32(10);
export const BIGINT_HUNDRED = BigInt.fromI32(100);

export const BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export const BIGDECIMAL_ONE = new BigDecimal(BIGINT_ONE);
export const BIGDECIMAL_HUNDRED = BigDecimal.fromString("100");

export const PROTOCOL_ID =
  "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9";

export const USDC_DECIMALS = 6;
export const DEFAULT_DECIMALS = BigInt.fromI32(18);
export const USDC_DENOMINATOR = BigDecimal.fromString("1000000");
export const ZERO_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export const ZERO_ADDRESS_STRING = "0x0000000000000000000000000000000000000000";
export const LINSPIRIT_ADDRESS = "0x5cc61a78f164885776aa610fb0fe1257df78e59b";
export const LIHND_ADDRESS = "0x5cc61a78f164885776aa610fb0fe1257df78e59b";

export const LQDR_ADDRESS = "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9";
export const SPIRIT_ADDRESS = "0x5cc61a78f164885776aa610fb0fe1257df78e59b";
export const HND_ADDRESS = "0x10010078a54396f62c96df8532dc2b4847d47ed3";

export const ShadowTokensUnderlying = new Map<string, string>().set(LINSPIRIT_ADDRESS, SPIRIT_ADDRESS).set(LIHND_ADDRESS, HND_ADDRESS)

export const LARGE_RANDOM_NUMBER = 1000

export const DEVELOPER_FEE = BigDecimal.fromString("0.05")


export const INT_NEGATIVE_ONE = -1 as i32;
export const INT_ZERO = 0 as i32;
export const INT_ONE = 1 as i32;
export const INT_TWO = 2 as i32;
export const INT_FOUR = 4 as i32;