const { initializeApp, cert } = require("firebase-admin/app");

const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require('./firestore.json');

initializeApp({credential: cert(serviceAccount)});

const db = getFirestore();
const sessionDocName = "sessionsSecure";

const getSessionKey = (ctx) =>
  ctx.from && ctx.chat && `${ctx.from.id}-${ctx.chat.id}`;
  
const writeXpubDataToSession = async (
  sessionKey,
  { accountXpub, addressesInfo }
) => {
  try {
    const sessionRef = db.collection(sessionDocName).doc(sessionKey);
    const sessionDataDoc = await sessionRef.get();
    if (!sessionDataDoc.exists) {
      console.log("No such user!");
      return;
    }
    const sessionData = sessionDataDoc.data();
    let XpubsInfo;
    if(sessionData.XpubsInfo){
      XpubsInfo = JSON.parse(sessionData.XpubsInfo);
    }else{
      XpubsInfo = [];
    }
    const loggedInXpub = accountXpub;
    await sessionRef.update({ loggedInXpub });
    const newXpubsInfo = [
      ...XpubsInfo.filter(
        (xpubInfo) => xpubInfo.accountXpub !== accountXpub
      ),
      {
        accountXpub,
        addressesInfo,
      },
    ];
    await sessionRef.update({
      XpubsInfo: JSON.stringify(newXpubsInfo),
    });
  } catch (e) {
    console.log(e);
  }
};

const getUserXpubsInfo = async (sessionKey) => {
  const sessionRef = db.collection(sessionDocName).doc(sessionKey);
  const sessionDataDoc = await sessionRef.get();
  if (!sessionDataDoc.exists) {
    throw Error("No such user!");
  }
  const sessionData = sessionDataDoc.data();
  if(sessionData?.XpubsInfo){
    return JSON.parse(sessionData?.XpubsInfo);
  }else
   return [];
};

const writeToSession = async (sessionKey, key, object) => {
  const sessionRef = db.collection(sessionDocName).doc(sessionKey);
  const sessionDataDoc = await sessionRef.get();
  if (!sessionDataDoc.exists) {
    throw Error("No such user!");
  }
  if(typeof key === "object"){
    return await sessionRef.update(key);
  }
  return await sessionRef.update({ [key]: object });
};
const checkNewUser = async (sessionKey) => {
  const userXpubsInfo = await getUserXpubsInfo(sessionKey);
  if (userXpubsInfo && userXpubsInfo.length > 0) {
    return false;
  }
  return true;
};
const userIdFromSessionKey = (sessionKey) => sessionKey.split("-")[0];

module.exports = {
  writeXpubDataToSession,
  checkNewUser,
  getUserXpubsInfo,
  writeToSession,
  userIdFromSessionKey
};
