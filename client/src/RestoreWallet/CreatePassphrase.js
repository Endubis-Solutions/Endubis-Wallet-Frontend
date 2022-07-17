import styled from "@emotion/styled";
import { useState } from "react";

const PassphraseForm = styled.form`
  max-width: 600px;
  margin: 0 auto;
  label {
    display: block;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 5px;
  color: #9b2e2e;
`;

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
    setIsValid(passphraseValidator(newPassphrase, confirmPassphrase));
  };
  const onConfirmPassphraseChange = (e) => {
    const newConfirmPassphrase = e.target.value;
    handleFormChange("confirmPassphrase", newConfirmPassphrase);
    setIsValid(passphraseValidator(passphrase, newConfirmPassphrase));
  };

  const passphraseValidator = (passphrase, confirmPassphrase) => {
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
    <PassphraseForm className="flow-content">
      <div className="flow-content">
        <label>Enter a passphrase (10 characters or more)</label>
        <input
          className="input fullwidth"
          type="password"
          value={passphrase}
          onChange={onPassphraseChange}
        />
      </div>
      <div className="flow-content">
        <label htmlFor="confirmPassphrase">Confirm passphrase</label>
        <input
          className="input fullwidth"
          type="password"
          id="confirmPassphrase"
          value={confirmPassphrase}
          onChange={onConfirmPassphraseChange}
        />
      </div>
      {errorMsg && (
        <ErrorMessage
          dangerouslySetInnerHTML={{ __html: errorMsg }}
        ></ErrorMessage>
      )}
    </PassphraseForm>
  );
}
export default CreatePassphrase;
