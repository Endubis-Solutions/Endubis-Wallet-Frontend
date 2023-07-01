const { default: axios } = require("axios");
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5005;
const bot = require("./botSession");
const {
  writeXpubDataToSession,
  getUserXpubsInfo,
  writeToSession,
  userIdFromSessionKey,
  getAllBotUserIds
} = require("./utils/firestore");
const { getAddressesInfo } = require("./utils/getAddressesInfo");

// const Cors = require("cors")
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Middlewares
// app.use(Cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Open port
app.listen(port, () => console.log("Listening on port " + port));

// ++++++++++++++++ HTTP METHODS +++++++++++++++++++ //

app.use((req, res, next) => {
  // console.log(req);
  next();
});
app.use(express.static(path.resolve(__dirname, "./client/build")));
app.get("/*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "./client/build", "index.html"));
});

app.post("/bot", (req, res) => {
  // console.log("tamir", req.body);
  res.end();
});

app.post("/broadcast", async (req, res) => {
  const broadcastSecret = process.env.BROADCASTSECRET;
  const {broadcastText, broadcastPass} = req.body;
  if(!broadcastSecret) {
    console.error('No Broadcast secret set. Please add a BROADCASTSECRET environment variable.');
    res.status("500").json("");
  }
  if(broadcastPass === broadcastSecret) {
    res.status("200").json("");

    let userIds = await getAllBotUserIds();
    userIds.forEach(userId => {
      bot.telegram.sendMessage(userId, broadcastText);
    });
    await writeToSession("broadcastedMessages", {
      [Date.now()]: broadcastText,
    });
  } else {
    res.status("401").json("");
  }
  res.end();
});

app.post("/connect", async (req, res) => {
  const { sessionKey, bech32xPub, encryptedMnemonic } = req.body;
  if (sessionKey && bech32xPub) {
    if (encryptedMnemonic) {
      //TODO: how about multiple accounts
      await writeToSession("encryptedMnemonic", {
        [sessionKey]: encryptedMnemonic,
      });
    }
    //TODO: remove this and get address list via api
    await getAddressesInfo(bech32xPub, sessionKey);
    //TODO: handle invalid links (hopefully on frontend)
    const userId = userIdFromSessionKey(sessionKey);
    const userInfo = await bot.telegram.getChat(userId);
    await writeToSession(sessionKey, {
      loggedInXpub: bech32xPub,
      userInfo,
      xpubWalletId: null,
    });
    bot.telegram.sendMessage(
      userId,
      `🎉 You have been successfully logged in.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🏠 Go To Your Account",
                callback_data: "back-to-menu",
              },
            ],
          ],
        },
      }
    );
  }
  res.end();
});
app.post("/send", async (req, res) => {
  const { sessionKey, unsignedTxHex, signedTxHex } = req.body;
  if (sessionKey && unsignedTxHex && signedTxHex) {
    const txSubmitURL = process.env.TX_SUBMIT_URL;
    if (!txSubmitURL) {
      throw Error("TX_SUBMIT_URL env variable missing");
    }
    let txBuffer = Buffer.from(signedTxHex, "hex");
    const submitExternalUrl = `${txSubmitURL}/proxy/transactions`;
    const config = {
      headers: {
        "Content-Type": "application/octet-stream",
      },
      timeout: 2000,
    };
    let statusCode, data;
    try {
      const res = await axios.post(submitExternalUrl, txBuffer, config);
      statusCode = res.status;
      data = res.data;
    } catch (e) {
      statusCode = e?.response?.status || 500;
      data = e?.response?.data || {};
      // console.log(e);
    }
    const userIdFromSessionKey = (sessionKey) => sessionKey.split("-")[0];
    const userId = userIdFromSessionKey(sessionKey);
    const regex = /2\d\d/;
    const success = regex.test(statusCode);
    if (success) {
      await writeToSession(sessionKey, { transactionId: data.id });

      bot.telegram.sendMessage(
        userId,
        `🟢 Transaction was successfully submitted.
Transaction ID: ${data.id}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "More Details",
                  callback_data: "txnid",
                },
              ],
              [
                {
                  text: "🏠 Go To Your Account",
                  callback_data: "back-to-menu",
                },
              ],
            ],
          },
        }
      );
    } else {
      bot.telegram.sendMessage(
        userId,
        `🔴 Transaction failed.
${JSON.stringify(data)}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🏠 Go To Your Account",
                  callback_data: "back-to-menu",
                },
              ],
            ],
          },
        }
      );
    }

    res.status(statusCode).json({ data });
  }
  res.end();
});
module.exports = app;
