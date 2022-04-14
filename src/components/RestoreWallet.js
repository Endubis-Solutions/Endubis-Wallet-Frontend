import Wizard from "./Wizard";
import EnterMnemonic from "./EnterMnemonic";
import CreatePassphrase from "./CreatePassphrase";
import Confirmation from "./Confirmation";
import { useEffect, useState } from "react";
import { mnemonicToXpub } from "../utils/newWalletTools/mnemonicToXpub";

const backendConnectURL = "/connect";
function RestoreWallet() {
  let userId = new URLSearchParams(window.location.search).get("userId");

  const [formData, setFormData] = useState({
    mnemonic: "",
    passphrase: "",
    confirmPassphrase: "",
  });
  const [result, setResult] = useState(null);
  const [isValid, setIsValid] = useState({
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
  const sendXpubToBackend = async (xpub) => {
    console.log("sending to backend");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ bech32xPub: xpub, userId }),
    };

    const res = await fetch(backendConnectURL, requestOptions);
    console.log(res);
    return res;
  };
  const onSubmit = async () => {
    try {
      console.log("submitting fn");
      const accountXpub = await mnemonicToXpub(formData.mnemonic);
      console.log(accountXpub);
      const res = await sendXpubToBackend(accountXpub);
      console.log({ res });
      if (res.status === 200) {
        setResult("success");
        console.log("Wallet restored successfully");
      } else {
        throw new Error();
      }
    } catch (err) {
      console.log(err);
      setResult("error");
    }
  };

  return (
    <Wizard noPrevOnFinalStep={true} onSubmit={onSubmit}>
      <EnterMnemonic
        mnemonic={formData.mnemonic}
        handleFormChange={handleFormChange}
        isValid={isValid.mnemonic}
        setIsValid={(newIsValid) => setIsValid({ mnemonic: newIsValid })}
      />
      <CreatePassphrase
        passphrase={formData.passphrase}
        confirmPassphrase={formData.confirmPassphrase}
        handleFormChange={handleFormChange}
        isValid={isValid.confirmPassphrase}
        setIsValid={(newIsValid) =>
          setIsValid({ confirmPassphrase: newIsValid })
        }
      />
      <Confirmation result={result} />
    </Wizard>
  );
}

export default RestoreWallet;