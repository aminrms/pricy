import axios from "axios";
import type { NobitexMarketsResponse } from "./nobitex.types.js";
import type { MarketStats } from "../../modules/market/market.types.js";

export class NobitexClient {
  private readonly baseUrl = "https://apiv2.nobitex.ir";

  async getMarginMarkets() {
    const response = await axios.get<NobitexMarketsResponse>(
      `${this.baseUrl}/margin/markets/list`,
      {
        params: {
          details: true,
        },
        headers: {
          "User-Agent": "TraderBot/CryptoMarketBot-1.0.0",
          Accept: "application/json",
        },
      }
    );

    return response.data.markets;
  }

  async getMarketStats(
    srcCurrency: string,
    dstCurrency: string
  ): Promise<MarketStats | undefined> {
    const response = await axios.get(
      `${this.baseUrl}/market/stats`,
      {
        params: {
          srcCurrency,
          dstCurrency,
        },
      }
    );

    const key = `${srcCurrency.toLowerCase()}-${dstCurrency.toLowerCase()}`;

    return response.data.stats?.[key];
  }
}

export const nobitexClient = new NobitexClient();