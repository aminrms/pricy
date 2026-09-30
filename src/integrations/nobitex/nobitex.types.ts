export type NobitexMarket = {
    symbol: string;
    baseCurrency: string;
    quoteCurrency: string;
    isActive: boolean;
    maxLeverage?: number | null;
};

export type NobitexMarketsResponse = {
    status: string;
    markets: Record<string, NobitexMarket>;
};