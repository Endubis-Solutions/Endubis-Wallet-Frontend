import { useState } from "react";

function CreatePassphrase({
  passphrase,
  confirmPassphrase,
  handleFormChange,
  setIsValid,
}) {
  const [errorMsg, setErrorMsg] = useState("");
  const onPassphraseChange = (e) => {
    const newPassphrase = e.target.value;
    handleFormChange("passphrase", newPassphrase);
    setIsValid(passphraseValidator(newPassphrase));
  };
  const onConfirmPassphraseChange = (e) => {
    const newConfirmPassphrase = e.target.value;
    handleFormChange("confirmPassphrase", newConfirmPassphrase);
    setIsValid(passphraseValidator(passphrase, newConfirmPassphrase));
  };

  const passphraseValidator = (passphrase, confirmPassphrase = "") => {
    const isEnoughLength = passphrase.length >= 10;
    if (!isEnoughLength) {
      setErrorMsg("Passphrase must be at least 10 characters");
      return false;
    }
    if (confirmPassphrase && passphrase !== confirmPassphrase) {
      setErrorMsg("The passwords don't match");
      return false;
    }
    setErrorMsg("");
    return true;
  };
  return (
    <div>
      <div>
        <label>Enter a passphrase (10 characters or more)</label>
        <input type="text" value={passphrase} onChange={onPassphraseChange} />
      </div>
      <div>
        <label htmlFor="confirmPassphrase">Confirm passphrase</label>
        <input
          type="text"
          id="confirmPassphrase"
          value={confirmPassphrase}
          onChange={onConfirmPassphraseChange}
        />
      </div>
      {errorMsg && <div className="error">{errorMsg}</div>}
    </div>
  );
}
export default CreatePassphrase;
