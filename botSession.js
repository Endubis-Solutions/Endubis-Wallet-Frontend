const { Telegraf } = require("telegraf");

const token = "5301758049:AAHyR9bI6b-JcsUr1Cq79eTX0ZHa9soNoWQ";
if (token === undefined) {
  throw new Error("TG_BOT_TOKEN must be provided!");
}
const bot = new Telegraf(token);

module.exports = bot;
//If you need a single bot instance use this
// if (!global.botInstance) {
//   const { Telegraf } = require("telegraf");

//   require("dotenv").config();

//   const token = process.env.TG_BOT_TOKEN;
//   if (token === undefined) {
//     throw new Error("TG_BOT_TOKEN must be provided!");
//   }
//   const bot = new Telegraf(token);
//   global.botInstance = bot;
// }
// module.exports = global.botInstance;
