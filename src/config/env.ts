import "dotenv/config"


export const env = {
    PORT: Number(process.env.PORT ?? 3000),

    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "",
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? "",

    TELEGRAM_PROXY: process.env.TELEGRAM_PROXY,

    PRICE_CHANGE_THRESHOLD_PERCENT: Number(
        process.env.PRICE_CHANGE_THRESHOLD_PERCENT ?? 0.5
    ),
}