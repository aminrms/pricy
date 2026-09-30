import { nobitexClient } from "../../integrations/nobitex/nobitex.client.js";
import type { MarketSnapshot } from "./market.types.js";
import { marketProcessor } from "./market.processor.js";

export class MarketPoller {
  private running = false;
  private polling = false;

  async start() {
    if (this.running) {
      console.log("Market poller already running - skip");
      return;
    }

    this.running = true;

    console.log(
      "Market poller started"
    );

    while (this.running) {
      // Overlap guard: اگر poll قبلی هنوز تمام نشده،
      // یک دور را رد کن تا پیام تکراری ساخته نشود
      if (this.polling) {
        console.log("POLL OVERLAP - SKIP");
      } else {
        this.polling = true;
        try {
          await this.poll();
        } catch (error) {
          console.error(
            "Market polling error:",
            error
          );
        } finally {
          this.polling = false;
        }
      }

      await this.sleep(30000);
    }
  }

  stop() {
    this.running = false;

    console.log(
      "Market poller stopped"
    );
  }

  private async poll() {
    /*
     * Fetch all markets we need.
     */

    const [
      btcRls,
      btcUsdt,

      ethRls,
      ethUsdt,

      usdtRls,

      xautRls,
      xautUsdt,
    ] = await Promise.all([
      nobitexClient.getMarketStats(
        "btc",
        "rls"
      ),

      nobitexClient.getMarketStats(
        "btc",
        "usdt"
      ),

      nobitexClient.getMarketStats(
        "eth",
        "rls"
      ),

      nobitexClient.getMarketStats(
        "eth",
        "usdt"
      ),

      nobitexClient.getMarketStats(
        "usdt",
        "rls"
      ),

      nobitexClient.getMarketStats(
        "xaut",
        "rls"
      ),

      nobitexClient.getMarketStats(
        "xaut",
        "usdt"
      ),
    ]);

    const snapshot: MarketSnapshot = {
      btcRls,
      btcUsdt,

      ethRls,
      ethUsdt,

      usdtRls,

      xautRls,
      xautUsdt,
    };

    console.log(
      "BTC/RLS:",
      btcRls?.latest
    );

    console.log(
      "BTC/USDT:",
      btcUsdt?.latest
    );

    console.log(
      "ETH/RLS:",
      ethRls?.latest
    );

    console.log(
      "ETH/USDT:",
      ethUsdt?.latest
    );

    console.log(
      "USDT/RLS:",
      usdtRls?.latest
    );

    console.log(
      "XAUT/RLS:",
      xautRls?.latest
    );

    console.log(
      "XAUT/USDT:",
      xautUsdt?.latest
    );

    /*
     * BTC/RLS is our trigger market.
     */

    if (!btcRls) {
      console.log(
        "BTC/RLS stats unavailable"
      );

      return;
    }

    await marketProcessor.process(
      "BTC-RLS",
      btcRls,
      snapshot
    );
  }

  private sleep(ms: number) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
  }
}

export const marketPoller =
  new MarketPoller();