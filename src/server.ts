import app from "./app.js";
import { env } from "./config/env.js";
import { marketPoller } from "./modules/market/market.poller.js";


app.listen(env.PORT, () => {
    console.log("Server is runing in the port:", env.PORT)

    void marketPoller.start();
})

for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
        console.log(`Received ${signal} - stopping poller`);
        marketPoller.stop();
    });
}