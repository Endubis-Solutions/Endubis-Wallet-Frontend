import Wizard from "./Wizard";
import EnterMnemonic from "./EnterMnemonic";
import CreatePassphrase from "./CreatePassphrase";
import Confirmation from "./Confirmation";
import { useEffect, useState } from "react";

function RestoreWallet() {
  const [formData, setFormData] = useState({
    mnemonic: "",
    passphrase: "",
    confirmPassphrase: "",
  });
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

  return (
    <Wizard noPrevOnFinalStep={true}>
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
      <Confirmation />
    </Wizard>
  );
}

export default RestoreWallet;
