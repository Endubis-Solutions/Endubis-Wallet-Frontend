import { useEffect, useState } from "react";
import allSeedWords from "../wordList";
import styled from "@emotion/styled";
import {
  getValidLastWords,
  sanitizeMnemonic,
  validateMnemonic,
} from "../utils/newWalletTools/helpers/mnemonicHelpers";
import CreatePassphrase from "./CreatePassphrase";
import { getEncryptedMnemonicFromSession } from "../utils/firestore";

const ErrorMessage = styled.div`
  margin-top: 5px;
  color: #9b2e2e;
`;
function EnterMnemonic({
  mnemonic,
  encryptMnemonic,
  handleFormChange,
  setIsValid,
  passphrase,
  confirmPassphrase,
  encryptedMnemonic,
  isCreate,
  spendingPassword,
}) {
  const [useSeedPhrase, setUseSeedPhrase] = useState(isCreate);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // const [encryptMnemonic, setEncryptMnemonic] = useState(false);
  let sessionKey = new URLSearchParams(window.location.search).get(
    "sessionKey"
  );
  const mnemonicValidator = (mnemonic) => {
    if (!mnemonic) {
      return;
    }
    const sanitizedMnemonic = sanitizeMnemonic(mnemonic);
    const wordsArray = sanitizedMnemonic
      .split(" ")
      .filter((word) => word !== "");

    const allInvalidWords = wordsArray
      .map((word) => word.trim())
      .filter((word) => word && !allSeedWords.includes(word));
    const areValidWords = allInvalidWords.length === 0;
    if (!areValidWords) {
      setErrorMsg(
        `<i>Word${
          allInvalidWords.length > 1 ? "s" : ""
        } <b><i>"${allInvalidWords.join(", ")}"</i></b> ${
          allInvalidWords.length > 1 ? "are" : "is"
        } not valid. ${
          allInvalidWords.some((word) => word.toLowerCase() !== word)
            ? "Try changing UPPERCASE letters to lowercase.</i>"
            : ""
        }`
      );
      return false;
    }
    const isValidLength = [15, 24].includes(wordsArray.length); //Only 15 or 24 words
    if (!isValidLength) {
      setErrorMsg("<i>Seed phrase needs to be 15 or 24 words long.</i>");
      return false;
    }

    if (!validateMnemonic(sanitizedMnemonic)) {
      const validWords = getValidLastWords(sanitizedMnemonic);
      setErrorMsg(
        `Seed checksum is invalid. <br />The final word can only be one of the following: <br /><i><b>${validWords.join(
          ", "
        )}</i></b>`
      );
      // setErrorMsg(`<i>Seed phrase is invalid.</i>`);
      return false;
    }
    setErrorMsg("");
    return true;
  };
  const onMnemonicChange = (e) => {
    const newMnemonic = e.target.value;
    handleFormChange("mnemonic", newMnemonic);
  };
  const onSpendingPasswordChange = (e) => {
    const newSpendingPassword = e.target.value;
    handleFormChange("spendingPassword", newSpendingPassword);
  };
  const onEncryptMnemonicChange = (e) => {
    const newEncryptMnemonicChange = e.target.checked;
    // console.log({ newEncryptMnemonicChange });
    handleFormChange("encryptMnemonic", newEncryptMnemonicChange);
  };
  const onUseSeedPhraseChange = (e) => {
    const newUseSeedPhrase = e.target.checked;
    setUseSeedPhrase(!!e.target.checked);
    newUseSeedPhrase && handleFormChange("spendingPassword", "");
  };
  useEffect(() => {
    if (spendingPassword) {
      setIsValid(true);
    } else {
      setIsValid(mnemonicValidator(mnemonic));
    }
  }, [mnemonic, spendingPassword]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const serverEncryptedMnemonic = await getEncryptedMnemonicFromSession(
        sessionKey
      );
      setIsLoading(false);
      handleFormChange("encryptedMnemonic", serverEncryptedMnemonic);
    })();
  }, []);
  return isLoading ? (
    <>
      <h1>Loading your wallet...</h1>
      <p>This may take a minute or two.</p>
    </>
  ) : (
    <div className="flow-content">
      {!useSeedPhrase && encryptedMnemonic ? (
        <>
          <label>Enter the your spending password</label>
          <input
            type="password"
            value={spendingPassword}
            onChange={onSpendingPasswordChange}
            className="input fullwidth"
          />
          <div>
            <input
              type="checkbox"
              name="enter-seed"
              id="enter-seed"
              checked={useSeedPhrase}
              onChange={onUseSeedPhraseChange}
              className="input checkbox"
            />
            <label htmlFor="enter-seed">Use a seed phrase</label>
          </div>
        </>
      ) : (
        <>
          <label>Enter the 15 or 24-word wallet mnemonic seed phrase</label>
          <input
            type="text"
            value={mnemonic}
            onChange={onMnemonicChange}
            className="input fullwidth"
          />
          <div>
            <input
              type="checkbox"
              name="encrypt-mnemonic"
              id="encrypt-mnemonic"
              checked={encryptMnemonic}
              onChange={onEncryptMnemonicChange}
              className="input checkbox"
            />
            <label htmlFor="encrypt-mnemonic">
              Encrypt and store seed phrase
            </label>
          </div>
        </>
      )}
      {}
      {encryptMnemonic && (
        <CreatePassphrase
          passphrase={passphrase}
          confirmPassphrase={confirmPassphrase}
          handleFormChange={handleFormChange}
          isValid={confirmPassphrase}
          setIsValid={(newIsValid) =>
            setIsValid({ confirmPassphrase: newIsValid })
          }
        />
      )}
      {errorMsg && (
        <ErrorMessage
          dangerouslySetInnerHTML={{ __html: errorMsg }}
        ></ErrorMessage>
      )}
    </div>
  );
}
export default EnterMnemonic;
