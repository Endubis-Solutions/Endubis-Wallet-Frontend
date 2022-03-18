import Wizard from "./Wizard";
import EnterMnemonic from "./EnterMnemonic";
import CreatePassphrase from "./CreatePassphrase";
import Confirmation from "./Confirmation";
import { useEffect, useState } from "react";

function RestoreWallet() {
  const [formData, setFormData] = useState({
    mnemonic: "",
    passphrase: "",
  });
  const [isValid, setIsValid] = useState({
    mnemonic: false,
    passphrase: false,
  });
  // useEffect(() => {
  //   console.log(formData);
  // }, [formData]);

  const setMnemonic = (newMnemonic) => {
    if (typeof newMnemonic === "function") {
      setFormData((oldFormData) => ({
        ...oldFormData,
        mnemonic: newMnemonic(oldFormData.mnemonic),
      }));
    } else {
      setFormData((oldFormData) => ({ ...oldFormData, mnemonic: newMnemonic }));
    }
  };

  const setPassphrase = (passphrase) => {
    if (typeof passphrase === "function") {
      setFormData((oldFormData) => ({
        ...oldFormData,
        passphrase: passphrase(oldFormData.mnemonic),
      }));
    } else {
      setFormData((oldFormData) => ({
        ...oldFormData,
        passphrase,
      }));
    }
  };
  return (
    <Wizard>
      <EnterMnemonic
        mnemonic={formData.mnemonic}
        setMnemonic={setMnemonic}
        isValid={isValid.mnemonic}
        setIsValid={(newIsValid) => setIsValid({ mnemonic: newIsValid })}
      />
      <CreatePassphrase
        passphrase={formData.passphrase}
        setPassphrase={setPassphrase}
        isValid={isValid.passphrase}
        setIsValid={(newIsValid) => setIsValid({ passphrase: newIsValid })}
      />
      <Confirmation />
    </Wizard>
  );
}

export default RestoreWallet;
