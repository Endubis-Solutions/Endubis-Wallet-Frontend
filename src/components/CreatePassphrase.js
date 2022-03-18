import { useState } from "react";

function CreatePassphrase({ passphrase, setPassphrase, setIsValid }) {
  const [errorMsg, setErrorMsg] = useState("");

  const onPassphraseChange = (e) => {
    const newPassphrase = e.target.value;
    setPassphrase(newPassphrase);
    setIsValid(passphraseValidator(newPassphrase));
  };

  const passphraseValidator = (passphrase) => {
    const isEnoughLength = passphrase.length >= 10;
    if (!isEnoughLength) {
      setErrorMsg("Passphrase must be at least 10 characters");
      return false;
    }
    setErrorMsg("");
    return true;
  };
  return (
    <div>
      <label>Enter a passphrase (10 Characters or more)</label>
      <input type="text" value={passphrase} onChange={onPassphraseChange} />
      {errorMsg && <div className="error">{errorMsg}</div>}
    </div>
  );
}
export default CreatePassphrase;
