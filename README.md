# PayRupee Payout Website

1. `npm install`
2. Copy `.env.example` to `.env`
3. Put your **new rotated** PayRupee Client Secret in `.env`
4. `npm start`
5. Open `http://localhost:3000`

The browser never receives the Client Secret. The server creates a unique order ID and sends the UPI payout request to the configured PayRupee endpoint.

Before enabling real payouts, verify your PayRupee account, payout limits, webhook/status handling, authentication for your own payout endpoint, duplicate-payout protection, and provider documentation.
