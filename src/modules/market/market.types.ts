export type MarketStats = {
  latest: string;
  bestSell: string;
  bestBuy: string;
  volumeSrc: string;
  volumeDst: string;
  mark: string;
  dayLow: string;
  dayHigh: string;
  dayOpen: string;
  dayClose: string;
  dayChange: string;
  isClosed: boolean;
};

export type MarketSnapshot = {
  btcRls?: MarketStats | undefined;
  btcUsdt?: MarketStats | undefined;

  ethRls?: MarketStats | undefined;
  ethUsdt?: MarketStats | undefined;

  usdtRls?: MarketStats | undefined;

  xautRls?: MarketStats | undefined;
  xautUsdt?: MarketStats | undefined;
};