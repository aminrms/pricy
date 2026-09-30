import { telegramClient } from "../../integrations/telegram/telegram.client.js";
import type {
    MarketSnapshot,
    MarketStats,
} from "../market/market.types.js";

type PriceChangeNotification = {
    symbol: string;

    previousPrice: string;
    currentPrice: string;
    changePercent: number;

    bestBuy: string;
    bestSell: string;

    snapshot: MarketSnapshot;
};

const DIVIDER = "━━━━━━━━━━━━━━━";

export class NotificationService {
    async sendPriceChangeNotification(
        event: PriceChangeNotification
    ) {
        const message = this.buildMessage(event);
        await telegramClient.send(message);
    }

    private buildMessage(
        event: PriceChangeNotification
    ): string {
        const isUp = event.changePercent >= 0;
        const trendIcon = isUp ? "📈" : "📉";
        const dirIcon = isUp ? "🔺" : "🔻";
        const sign = isUp ? "+" : "";

        const changeStr = `${sign}${event.changePercent.toFixed(2)}%`;

        const now = new Date();
        const time = now.toLocaleTimeString("fa-IR-u-nu-latn", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Tehran",
        });
        const date = now.toLocaleDateString("fa-IR-u-nu-latn", {
            timeZone: "Asia/Tehran",
        });

        const btc = this.coinBlock({
            icon: "🟠",
            faName: "بیت‌کوین",
            symbol: "BTC",
            usdt: event.snapshot.btcUsdt?.latest,
            rls: event.snapshot.btcRls?.latest,
            extra: [
                `${dirIcon} تغییر لحظه‌ای: <code>${changeStr}</code>`,
                `🟢 خرید: <code>${this.formatToman(event.bestBuy)}</code>`,
                `🔴 فروش: <code>${this.formatToman(event.bestSell)}</code>`,
            ],
        });

        const eth = this.coinBlock({
            icon: "🔷",
            faName: "اتریوم",
            symbol: "ETH",
            usdt: event.snapshot.ethUsdt?.latest,
            rls: event.snapshot.ethRls?.latest,
            dayChange: event.snapshot.ethRls?.dayChange,
        });

        const usdt = this.coinBlock({
            icon: "💲",
            faName: "تتر",
            symbol: "USDT",
            rls: event.snapshot.usdtRls?.latest,
            dayChange: event.snapshot.usdtRls?.dayChange,
            hideUsdtLine: true,
        });

        const xaut = this.coinBlock({
            icon: "🪙",
            faName: "تتر گلد",
            symbol: "XAUT",
            usdt: event.snapshot.xautUsdt?.latest,
            rls: event.snapshot.xautRls?.latest,
            dayChange: event.snapshot.xautRls?.dayChange,
        });

        return [
            `${trendIcon} <b>نبض بازار | نوبیتکس</b>`,
            DIVIDER,
            btc,
            DIVIDER,
            eth,
            DIVIDER,
            usdt,
            DIVIDER,
            xaut,
            DIVIDER,
            `⏰ ساعت: <code>${time}</code> | 📅 تاریخ: <code>${date}</code>`,
        ].join("\n\n");
    }

    private coinBlock(opts: {
        icon: string;
        faName: string;
        symbol: string;
        usdt?: string | undefined;
        rls?: string | undefined;
        dayChange?: string | undefined;
        hideUsdtLine?: boolean | undefined;
        extra?: string[] | undefined;
    }): string {
        const lines = [
            `${opts.icon} <b>${opts.faName} | ${opts.symbol}</b>`,
        ];

        if (!opts.hideUsdtLine) {
            lines.push(
                `💵 1 ${opts.symbol} = <code>${this.formatUsdt(opts.usdt)}</code> USDT`
            );
        }

        const tomanLabel =
            opts.symbol === "USDT"
                ? `💴 1 ${opts.symbol} = <code>${this.formatToman(opts.rls)}</code> تومان`
                : `💴 1 ${opts.symbol} = <code>${this.formatToman(opts.rls)}</code> تومان`;

        lines.push(tomanLabel);

        if (opts.dayChange !== undefined) {
            const dc = Number(opts.dayChange);
            if (Number.isFinite(dc)) {
                const icon = dc >= 0 ? "🟢" : "🔴";
                const sign = dc >= 0 ? "+" : "";
                lines.push(
                    `${icon} تغییر 24 ساعته: <code>${sign}${dc.toFixed(2)}%</code>`
                );
            }
        }

        if (opts.extra) {
            lines.push(...opts.extra);
        }

        return lines.join("\n");
    }

    private formatDayChange(dayChange?: string): string {
        if (dayChange === undefined) return "n/a";
        const dc = Number(dayChange);
        if (!Number.isFinite(dc)) return "n/a";
        const sign = dc >= 0 ? "+" : "";
        return `${sign}${dc.toFixed(2)}%`;
    }

    /** USDT با رقم انگلیسی و جداکننده هزارگان */
    private formatUsdt(price?: string): string {
        if (!price) return "n/a";
        const value = Number(price);
        if (!Number.isFinite(value)) return "n/a";

        const frac =
            value >= 1000 ? 2 : value >= 100 ? 2 : 4;

        return value.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: frac,
        });
    }

    /** ورودی ریال نوبیتکس → خروجی تومان با رقم انگلیسی */
    private formatToman(rlsPrice?: string): string {
        if (!rlsPrice) return "n/a";
        const value = Number(rlsPrice);
        if (!Number.isFinite(value)) return "n/a";

        const toman = Math.round(value / 10);
        return toman.toLocaleString("en-US", {
            maximumFractionDigits: 0,
        });
    }

    // برای سازگاری اگر جایی لازم شد
    formatPrice(price?: string): string {
        return this.formatToman(price);
    }
}

export const notificationService =
    new NotificationService();

export type { MarketStats };
