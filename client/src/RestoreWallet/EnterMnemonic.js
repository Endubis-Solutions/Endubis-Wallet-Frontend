import { useEffect, useState } from "react";
import allSeedWords from "../wordList";
import styled from "@emotion/styled";
import {
  getValidLastWords,
  sanitizeMnemonic,
  validateMnemonic,
} from "../utils/newWalletTools/helpers/mnemonicHelpers";

const ErrorMessage = styled.div`
  margin-top: 5px;
  color: #9b2e2e;
`;
function EnterMnemonic({ mnemonic, handleFormChange, setIsValid }) {
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    setIsValid(mnemonicValidator(mnemonic));
  }, [mnemonic]);
  return (
    <div className="flow-content">
      <label>Enter the 15 or 24-word wallet mnemonic seed phrase</label>
      <input
        type="text"
        value={mnemonic}
        onChange={onMnemonicChange}
        className="input fullwidth"
      />
      {errorMsg && (
        <ErrorMessage
          dangerouslySetInnerHTML={{ __html: errorMsg }}
        ></ErrorMessage>
      )}
    </div>
  );
}
export default EnterMnemonic;
