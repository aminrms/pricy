import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";
import { env } from "../../config/env.js";
import type { NotificationChannel } from "../../modules/notification/notification.channel.js";

export class TelegramClient implements NotificationChannel {
    private readonly baseUrl: string;
    private readonly agent: SocksProxyAgent | undefined;
    private lastMessage: string | null = null;
    private lastSentAt = 0;
    private static readonly DEDUP_WINDOW_MS = 90 * 1000;

    constructor() {
        this.baseUrl =
            `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

        if (env.TELEGRAM_PROXY) {
            this.agent = new SocksProxyAgent(env.TELEGRAM_PROXY);
        }
    }

    async send(message: string) {
        // Last-mile guard: Telegram sometimes gets the same
        // sendMessage twice (retries / two poller loops).
        // Skip identical text sent within the dedup window.
        const now = Date.now();
        if (
            this.lastMessage === message &&
            now - this.lastSentAt <
                TelegramClient.DEDUP_WINDOW_MS
        ) {
            console.log(
                "DUPLICATE TELEGRAM MESSAGE SKIPPED"
            );
            return;
        }
        this.lastMessage = message;
        this.lastSentAt = now;

        await axios.post(
            `${this.baseUrl}/sendMessage`,
            {
                chat_id: env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "HTML",
                disable_web_page_preview: true,
            },
            {
                httpsAgent: this.agent,
            }
        );
    }
}

export const telegramClient = new TelegramClient();