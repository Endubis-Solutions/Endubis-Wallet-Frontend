import { db, getSessionKey, sessionDocName } from "./firestoreInit";
import { collection,query, where, doc, getDoc, getDocs, getCountFromServer } from "firebase/firestore";

const getTxDataFromSession = async (sessionKey) => {
  const docRef = doc(db, sessionDocName, sessionKey);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  return docSnap.data().unsignedTx;
  // const sessionRef = db.collection(sessionDocName).doc(sessionKey);
  // const sessionDataDoc = await sessionRef.get();
  // if (!sessionDataDoc.exists) {
  //   console.log("No such user!");
  //   return;
  // }
  // const sessionData = sessionDataDoc.data();
  // return sessionData.unsignedTx;
};
const writeXpubDataToSession = async (
  sessionKey,
  { accountXpub, addressesInfo }
) => {
  try {
    const sessionRef = db.collection(sessionDocName).doc(sessionKey);
    const sessionDataDoc = await sessionRef.get();
    if (!sessionDataDoc.exists) {
      // console.log("No such user!");
      return;
    }
    const sessionData = sessionDataDoc.data();
    const loggedInXpub = accountXpub;
    await sessionRef.update({ loggedInXpub });
    const newXpubsInfo = [
      ...sessionData.XpubsInfo.filter(
        (xpubInfo) => xpubInfo.accountXpub !== accountXpub
      ),
      {
        accountXpub,
        addressesInfo,
      },
    ];
    await sessionRef.update({
      XpubsInfo: newXpubsInfo,
    });
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
  return sessionData.XpubsInfo;
};
const getEncryptedMnemonicFromSession = async (sessionKey) => {
  const docRef = doc(db, sessionDocName, "encryptedMnemonic");
  const docSnap = await getDoc(docRef);
  // console.log({ exists: docSnap.data() });
  if (!docSnap.exists()) {
    return null;
  }
  return docSnap.data()[sessionKey];
};

const writeToSession = async (sessionKey, object) => {
  const sessionRef = db.collection(sessionDocName).doc(sessionKey);
  const sessionDataDoc = await sessionRef.get();
  if (!sessionDataDoc.exists) {
    throw Error("No such user!");
  }
  await sessionRef.update(object);
};
const checkNewUser = async (sessionKey) => {
  const userXpubsInfo = await getUserXpubsInfo(sessionKey);
  if (userXpubsInfo && userXpubsInfo.length > 0) {
    return false;
  }
  return true;
};

// const getAllBotUserIds = async () => {
//   const q = query(collection(db, sessionDocName), where("userInfo", "!=", null))
//   const allDataSnapshot = await getDocs(q);
//   if (allDataSnapshot.empty) {
//     console.log('No matching documents.');
//     return;
//   }  
//   const allUserIds = [];
//   allDataSnapshot.forEach(doc => {
//     const content = doc.data();
//     if(content.userInfo?.id) {
//       allUserIds.push(String(content.userInfo.id));
//     }
//   });
//   return allUserIds;  
// }

const getUsersCount = async () => {
  const coll = collection(db, sessionDocName);
  const snapshot = await getCountFromServer(coll);
  return snapshot.data().count - 2; // Because encryptedMnemonic and broadcastedMessages also reside here
}

export {
  getUserXpubsInfo,
  writeToSession,
  getTxDataFromSession,
  getEncryptedMnemonicFromSession,
  // getAllBotUserIds,
  getUsersCount
};
