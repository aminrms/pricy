import { env } from "../../config/env.js";
import { notificationService } from "../notification/notification.service.js";
import type {
  MarketSnapshot,
  MarketStats,
} from "./market.types.js";

export class MarketProcessor {
  private previousPrices = new Map<string, string>();
  private lastNotifiedAt = 0;
  private sending = false;
  private static readonly COOLDOWN_MS = 3 * 60 * 1000;

  async process(
    symbol: string,
    stats: MarketStats,
    snapshot: MarketSnapshot
  ) {
    console.log(
      "PROCESSOR RECEIVED:",
      symbol,
      stats.latest
    );

    const previousPrice = this.previousPrices.get(symbol);

    console.log(
      "PREVIOUS PRICE:",
      previousPrice
    );

    this.previousPrices.set(
      symbol,
      stats.latest
    );

    // First poll
    if (!previousPrice) {
      console.log(
        "FIRST PRICE - NO NOTIFICATION"
      );

      return;
    }

    // No price change
    if (previousPrice === stats.latest) {
      console.log(
        "PRICE DID NOT CHANGE"
      );

      return;
    }

    const previous = Number(previousPrice);
    const current = Number(stats.latest);

    const changePercent =
      ((current - previous) / previous) * 100;

    console.log(
      "CHANGE:",
      changePercent
    );

    if (
      Math.abs(changePercent) <
      env.PRICE_CHANGE_THRESHOLD_PERCENT
    ) {
      console.log(
        "THRESHOLD NOT REACHED"
      );

      return;
    }

    console.log(
      "THRESHOLD REACHED"
    );

    // جلوگیری از ارسال دو پیام پشت سر هم (اسپم)
    const nowMs = Date.now();
    if (
      nowMs - this.lastNotifiedAt <
      MarketProcessor.COOLDOWN_MS
    ) {
      console.log("COOLDOWN - SKIP NOTIFICATION");
      return;
    }

    // Single-flight: دو فراخوانی همزمان نتوانند
    // همزمان از گارد کوoldown رد شوند
    if (this.sending) {
      console.log("ALREADY SENDING - SKIP DUPLICATE");
      return;
    }
    this.sending = true;
    this.lastNotifiedAt = nowMs;

    try {
      await notificationService.sendPriceChangeNotification({
        symbol,
        previousPrice,
        currentPrice: stats.latest,
        changePercent,
        bestBuy: stats.bestBuy,
        bestSell: stats.bestSell,
        snapshot,
      });
    } finally {
      this.sending = false;
    }

    console.log(
      "NOTIFICATION SENT"
    );
  }
}

export const marketProcessor =
  new MarketProcessor();