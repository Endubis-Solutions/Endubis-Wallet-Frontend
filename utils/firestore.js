const { initializeApp, cert } = require("firebase-admin/app");

const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require('./firestore.json');

initializeApp({credential: cert(serviceAccount)});

const db = getFirestore();
const sessionDocName = "sessionsSecureNew";

const getSessionKey = (ctx) =>
  ctx.from && ctx.chat && `${ctx.from.id}-${ctx.chat.id}`;
  
const writeXpubDataToSession = async (
  sessionKey,
  { accountXpub, addressesInfo }
) => {
  try {
    const sessionRef = db.collection(sessionDocName).doc(sessionKey);
    const sessionDataDoc = await sessionRef.get();
    // if (!sessionDataDoc.exists) {
    //   console.log("No such user!");
    //   return;
    // }
    const sessionData = sessionDataDoc.data();
    let XpubsInfo;
    if(sessionData?.XpubsInfo){
      XpubsInfo = JSON.parse(sessionData.XpubsInfo);
    }else{
      XpubsInfo = [];
    }
    const loggedInXpub = accountXpub;
    // await sessionRef.update({  });
    const newXpubsInfo = [
      ...XpubsInfo.filter(
        (xpubInfo) => xpubInfo.accountXpub !== accountXpub
      ),
      {
        accountXpub,
        addressesInfo,
      },
    ];
    if (sessionDataDoc.exists) {
      await sessionRef.update({
        XpubsInfo: JSON.stringify(newXpubsInfo),
        loggedInXpub
      });
    } else {
      await sessionRef.set({
        XpubsInfo: JSON.stringify(newXpubsInfo),
        loggedInXpub
      });
    }
    
  } catch (e) {
    // console.log(e);
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
    if(typeof key === "object"){
      return await sessionRef.set(key);
    }
    return await sessionRef.set({ [key]: object });
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

const getAllBotUserIds = async () => {
  const allDataRef = db.collection(sessionDocName);
  const allDataSnapshot = await allDataRef.where('userInfo', '!=', null).get();
  if (allDataSnapshot.empty) {
    console.log('No matching documents.');
    return;
  }  
  const allUserIds = [];
  allDataSnapshot.forEach(doc => {
    const content = doc.data();
    if(content.userInfo?.id) {
      allUserIds.push(String(content.userInfo.id));
    }
  });
  return allUserIds;  
}

module.exports = {
  writeXpubDataToSession,
  checkNewUser,
  getUserXpubsInfo,
  writeToSession,
  userIdFromSessionKey,
  getAllBotUserIds
};
