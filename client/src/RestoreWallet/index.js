import Wizard from "../components/Wizard";
import EnterMnemonic from "./EnterMnemonic";
import CreatePassphrase from "./CreatePassphrase";
import Confirmation from "./Confirmation";
import { useEffect, useState } from "react";
import { mnemonicToXpub } from "../utils/newWalletTools/mnemonicToXpub";
import CreateMnemonic from "./CreateMnemonic";
import { AESDecrypt, AESEncrypt } from "../utils/encryption";

const backendConnectURL = "/connect";
function RestoreWallet({ showCreate }) {
  let sessionKey = new URLSearchParams(window.location.search).get(
    "sessionKey"
  );

  const [formData, setFormData] = useState({
    mnemonic: "",
    passphrase: "",
    confirmPassphrase: "",
    encryptMnemonic: false,
    encryptedMnemonic: null,
    spendingPassword: "",
  });
  const [result, setResult] = useState(null);
  const [isValid, setIsValid] = useState({
    generated: false,
    mnemonic: false,
    passphrase: false,
    confirmPassphrase: true,
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
      // console.log({ field, newValue });
      setFormData((oldFormData) => ({ ...oldFormData, [field]: newValue }));
    }
  };
  const sendToBackend = async (xpub, encryptedMnemonic) => {
    // console.log("sending to backend");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ bech32xPub: xpub, sessionKey, encryptedMnemonic }),
    };

    const res = await fetch(backendConnectURL, requestOptions);
    // console.log(res);
    return res;
  };
  const onSubmit = async () => {
    try {
      let mnemonic = formData.mnemonic;
      if (formData.encryptedMnemonic && formData.spendingPassword) {
        mnemonic = AESDecrypt(
          formData.encryptedMnemonic,
          formData.spendingPassword
        );
      }
      const encryptedMnemonic =
        formData.encryptMnemonic &&
        AESEncrypt(formData.mnemonic, formData.passphrase);

      // console.log("submitting fn");
      const accountXpub = await mnemonicToXpub(mnemonic);
      // console.log(accountXpub);
      const res = await sendToBackend(accountXpub, encryptedMnemonic);
      // console.log({ res });
      if (res.status === 200) {
        setResult("success");
        // console.log("Wallet restored successfully");
      } else {
        throw new Error();
      }
    } catch (err) {
      // console.log(err);
      setResult("error");
    }
  };

  return (
    <Wizard noPrevOnFinalStep={true} onSubmit={onSubmit}>
      {showCreate && (
        <CreateMnemonic
          setIsValid={(newIsValid) => setIsValid({ generated: newIsValid })}
          isValid={isValid.generated}
        />
      )}
      <EnterMnemonic
        mnemonic={formData.mnemonic}
        encryptMnemonic={formData.encryptMnemonic}
        passphrase={formData.passphrase}
        confirmPassphrase={formData.confirmPassphrase}
        encryptedMnemonic={formData.encryptedMnemonic}
        spendingPassword={formData.spendingPassword}
        handleFormChange={handleFormChange}
        isValid={isValid.mnemonic}
        isCreate={showCreate}
        setIsValid={(newIsValid) => setIsValid({ mnemonic: newIsValid })}
      />
      {/* <CreatePassphrase
        passphrase={formData.passphrase}
        confirmPassphrase={formData.confirmPassphrase}
        handleFormChange={handleFormChange}
        isValid={isValid.confirmPassphrase}
        setIsValid={(newIsValid) =>
          setIsValid({ confirmPassphrase: newIsValid })
        }
      /> */}
      <Confirmation result={result} />
    </Wizard>
  );
}

export default RestoreWallet;
