import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJdrQrl02YIfbr-RIodYL9aUgrDyyXFB8",
  authDomain: "endubis-wallet-bot.firebaseapp.com",
  projectId: "endubis-wallet-bot",
  storageBucket: "endubis-wallet-bot.appspot.com",
  messagingSenderId: "218401415949",
  appId: "1:218401415949:web:bbe4b9b882b7d66c9f8644",
  measurementId: "G-LP3GX2WVZY",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const sessionDocName = "sessionsSecureNew";
const getSessionKey = (ctx) =>
  ctx.from && ctx.chat && `${ctx.from.id}-${ctx.chat.id}`;
const userIdFromSessionKey = (sessionKey) => sessionKey.split("-")[0];

export { db, getSessionKey, userIdFromSessionKey, sessionDocName };
