import Wizard from "../components/Wizard";
import { useEffect, useState } from "react";
import TxSummary from "./TxSummary";
import EnterMnemonic from "../RestoreWallet/EnterMnemonic";
import SendConfirmation from "./SendConfirmation";
import { getTxDataFromSession } from "../utils/firestore";
import { getSignedTxHex } from "../utils/serializationHelpers";
// import loadCardanoWasm from "utils/Loader";

const backendURL = "https://endubis-frontend.onrender.com/send";
const backendConnectURL = "https://endubis-frontend.onrender.com/connect";
function Send() {
  let sessionKey = new URLSearchParams(window.location.search).get(
    "sessionKey"
  );

  const [unsignedTx, setUnsignedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const sessionKey = new URLSearchParams(window.location.search).get(
      "sessionKey"
    );
    if (!sessionKey) {
      throw Error("No Session Key");
    }
    getTxDataFromSession(sessionKey).then((unsignedTx) => {
      setUnsignedTx(unsignedTx);
      setLoading(false);
    });
  }, []);

  const [formData, setFormData] = useState({
    mnemonic: "",
  });
  const [result, setResult] = useState({});
  const [isValid, setIsValid] = useState({
    generated: false,
    mnemonic: false,
    passphrase: false,
    confirmPassphrase: false,
  });
  // useEffect(() => {
  //   console.log(formData);
  // }, [formData]);

  const handleFormChange = (field, newValue) => {
    if (typeof newValue === "function") {
      setFormData((oldFormData) => ({
        ...oldFormData,
        [field]: newValue(oldFormData[field]),
      }));
    } else {
      setFormData((oldFormData) => ({ ...oldFormData, [field]: newValue }));
    }
  };
  const sendSignedTxHexToBackend = async (signedTxHex, unsignedTxHex) => {
    // console.log("sending signedTxHex to backend");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ unsignedTxHex, signedTxHex, sessionKey }),
    };

    const res = await fetch(backendURL, requestOptions);
    return res;
  };
  const onSubmit = async () => {
    try {
      const { unsignedTxHex, coinSelection } = unsignedTx;
      const signedTxHex = getSignedTxHex(
        unsignedTxHex,
        coinSelection,
        formData.mnemonic
      );
      const res = await sendSignedTxHexToBackend(signedTxHex, unsignedTxHex);
      if (/2\d\d/.test(res.status)) {
        setResult({ type: "success", data: res.data });
      } else {
        setResult({ type: "error", data: res.data });
      }
    } catch (error) {
      // console.log(error);
    }
    // try {
    //   console.log("submitting fn");
    //   const accountXpub = await mnemonicToXpub(formData.mnemonic);
    //   console.log(accountXpub);
    //   const res = await sendXpubToBackend(accountXpub);
    //   console.log({ res });
    //   if (res.status === 200) {
    //     setResult("success");
    //     console.log("Wallet restored successfully");
    //   } else {
    //     throw new Error();
    //   }
    // } catch (err) {
    //   console.log(err);
    //   setResult("error");
    // }
  };

  return (
    <Wizard noPrevOnFinalStep={true} onSubmit={onSubmit}>
      <TxSummary isValid={!loading} unsignedTx={unsignedTx} loading={loading} />
      <EnterMnemonic
        mnemonic={formData.mnemonic}
        handleFormChange={handleFormChange}
        isValid={isValid.mnemonic}
        setIsValid={(newIsValid) => setIsValid({ mnemonic: newIsValid })}
      />
      <SendConfirmation result={result} />
    </Wizard>
  );
}

export default Send;
