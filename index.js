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
  getAllBotUserIds,
  saveWithdrawal,
  saveSendResult
} = require("./utils/firestore");
const { getAddressesInfo } = require("./utils/getAddressesInfo");

const Cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const corsOptions = {
  origin: "https://endubis.io", // or use '*' to allow any origin
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  optionsSuccessStatus: 200,
};
const fetch = require("cross-fetch");

// Middlewares
app.use(Cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Open port
app.listen(port, () => console.log("Listening on port " + port));

// ++++++++++++++++ HTTP METHODS +++++++++++++++++++ //

// app.use(express.static(path.resolve(__dirname, "./client/build")));
// app.get("/*", (req, res, next) => {
//   res.sendFile(path.join(__dirname, "./client/build", "index.html"));
// });

app.post("/bot", (req, res) => {
  // console.log("tamir", req.body);
  res.end();
});

app.post("/utxo", async (req, res) => {
  // https://explorer2.adalite.io/api/bulk/addresses/utxo
  // console.log("tamir", req.body);
  try {
   
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    };
    const response = await fetch('https://explorer2.adalite.io/api/bulk/addresses/utxo', requestOptions).then((res) => res.json());
    
    res.json(response);
} catch (error) {
    console.error('Error posting to the API:', error);
    res.status(500).send('Failed to post data');
}
res.end();
});

app.post("/summary", async (req, res) => {
  try {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    };
    const response = await fetch('https://explorer2.adalite.io/api/bulk/addresses/summary', requestOptions).then((res) => res.json());
   
    res.json(response);
} catch (error) {
    console.error('Error posting to the API:', error);
    res.status(500).send('Failed to post data');
}
res.end();
  // https://explorer2.adalite.io/api/bulk/addresses/summary
  // console.log("tamir", req.body);
});

app.post("/broadcast", async (req, res) => {
  const broadcastSecret = process.env.BROADCASTSECRET;
  let { broadcastText, broadcastPass } = req.body;
  if (!broadcastSecret) {
    console.error(
      "No Broadcast secret set. Please add a BROADCASTSECRET environment variable."
    );
    res.status("500").json("");
  } else if (broadcastPass === broadcastSecret) {
    res.status("200").json("");

    let allUserIds = await getAllBotUserIds();
    allUserIds.forEach((userId) => {
      try {
        bot.telegram
          .sendMessage(String(userId), broadcastText, { parse_mode: "HTML" })
          .then((r) => console.log(`sent to ${userId}`))
          .catch((e) => console.log(e));
      } catch (e) {
        console.log(e);
      }
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
  console.log("connecting", { sessionKey, bech32xPub, encryptedMnemonic });
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

const submitTransaction = async (signedTxHex) => {
  const txSubmitURL = process.env.TX_SUBMIT_URL;
  const blockFrostProjectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!txSubmitURL || !blockFrostProjectId) {
    throw Error("TX_SUBMIT_URL or BLOCKFROST_PROJECT_ID env variable missing");
  }
  let txBuffer = Buffer.from(signedTxHex, "hex");
  return axios({
    headers: {
      "Content-Type": "application/cbor",
      project_id: blockFrostProjectId,
    },
    method: "post",
    url: txSubmitURL,
    data: txBuffer,
  });
};
app.post("/send", async (req, res) => {
  const { sessionKey, signedTxHex, amountLovelace, receiverAddress } = req.body;
  let statusCode, data;
  if (sessionKey && signedTxHex) {
    try {
      const sendResult = await submitTransaction(signedTxHex);
      statusCode = sendResult.status;
      data = sendResult.data;
    } catch (e) {
      statusCode = e?.response?.status || 500;
      data = e?.response?.data || {};
    }
    const userIdFromSessionKey = (sessionKey) => sessionKey.split("-")[0];
    const userId = userIdFromSessionKey(sessionKey);
    const regex = /2\d\d/;
    const success = regex.test(statusCode);
    if (success) {
      const txHash = data;
      bot.telegram.sendMessage(
        userId,
        `<b>🟢 Transaction was successfully submitted.</b>
<b>Transaction ID:</b> 
<code>${txHash}</code>

<b>Sent Amount: </b><i>${amountLovelace / 1000000} ada</i>
<b>Receiver Address: </b>
<code>${receiverAddress}</code>
`,
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
          parse_mode: "HTML",
        }
      );
      // await writeToSession(sessionKey, { transactionId: data });
      const sendResult = {
        transactionId: txHash, 
        amountLovelace, 
        receiverAddress
      };
      await saveSendResult(sessionKey, sendResult);
      
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
  } else {
    res.status(400).json({ data: {} });
  }
  res.end();
});

const admins = ["345931304", "467338947"];

app.post("/withdraw", async (req, res) => {
  const { sessionKey, 
    signedTxHex, 
    phone,
    amountInCurrency,
    currency,
    amountAda,
    adaToKesRate,
    adaToEtbRate,
    fee,
    withdrawMethod
  } = req.body;
  let statusCode, data;
  if (sessionKey && signedTxHex) {
    try {
      const sendResult = await submitTransaction(signedTxHex);
      statusCode = sendResult.status;
      data = sendResult.data;
    } catch (e) {
      statusCode = e?.response?.status || 500;
      data = e?.response?.data || {};
    }
    const userIdFromSessionKey = (sessionKey) => sessionKey.split("-")[0];
    const userId = userIdFromSessionKey(sessionKey);
    const regex = /2\d\d/;
    const success = regex.test(statusCode);
    if (success) {
      const txHash = data;
      const feeData = fee ? `\n<b>Txn Fee:</b> <i>${fee / 1000000} ada</i>` : ``;
      bot.telegram.sendMessage(
        userId,
        `🟢 Withdrawal Successfully Submitted
Withdrawal Details:
<b>Withdrawal ID (TxID):</b>
<code>${txHash}</code>

${feeData}
<b>Withdrawal Request:</b> <i>${amountInCurrency} ${currency}</i>
<b>Withdrawn ADA:</b> <i>${amountAda} ada</i>
<b>Withdrawal Method:</b> <i>${withdrawMethod}</i>
<b>Withdrawal Phone Number:</b> <i>${phone}</i>
${
  withdrawMethod === "telebirr"
    ? `<b>Receivable (in ETB):</b> <i>${Math.ceil(amountAda * adaToEtbRate)}</i>`
    : withdrawMethod == "mpesa"
    ? `<b>Receivable (in KSh):</b> <i>${Math.ceil(amountAda * adaToKesRate)}</i>`
    : ""
}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "More Details",
                  callback_data: "withdraw-txnid",
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
          parse_mode: "HTML",
        }
      );
      admins.forEach(adminId => {
        bot.telegram.sendMessage(
          adminId,
          `🟢 New Withdrawal Request Received
  Withdrawal Details:
  <b>Withdrawal ID (TxID):</b>
  <code>${txHash}</code>
  
  ${feeData}
  <b>Withdrawal Request:</b> <i>${amountInCurrency} ${currency}</i>
  <b>Withdrawn ADA:</b> <i>${amountAda} ada</i>
  <b>Withdrawal Method:</b> <i>${withdrawMethod}</i>
  <b>Withdrawal Phone Number:</b> <i>${phone}</i>
  <b>User Id:</b> <i>${userId}</i>
  <b>Date Received</b> <i>${new Date().toString()}</i>
  ${
    withdrawMethod === "telebirr"
      ? `<b>Receivable (in ETB):</b> <i>${Math.ceil(amountAda * adaToEtbRate)}</i>`
      : withdrawMethod == "mpesa"
      ? `<b>Receivable (in KSh):</b> <i>${Math.ceil(amountAda * adaToKesRate)}</i>`
      : ""
  }`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "More Details",
                    callback_data: "withdraw-txnid",
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
            parse_mode: "HTML",
          }
        );
      })

      const withdrawData = {
        transactionId: txHash, 
        phone,
        amountInCurrency,
        currency,
        amountAda,
        adaToKesRate,
        adaToEtbRate,
        withdrawMethod,
        status: 'pending'
      };
      await saveWithdrawal(sessionKey, withdrawData);

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
  } else {
    res.status(400).json({ data: {} });
  }
  res.end();
});

module.exports = app;
