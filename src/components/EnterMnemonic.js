import { useState } from "react";
import allSeedWords from "../wordList";

function EnterMnemonic({ mnemonic, setMnemonic, setIsValid }) {
  const [errorMsg, setErrorMsg] = useState("");

  const mnemonicValidator = (mnemonic) => {
    const wordsArray = mnemonic.split(" ").filter((word) => word !== "");
    const allInvalidWords = wordsArray
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word && !allSeedWords.includes(word));
    const areValidWords = allInvalidWords.length === 0;
    if (!areValidWords) {
      setErrorMsg(
        `Word${allInvalidWords.length > 1 ? "s" : ""} ${allInvalidWords.join(
          ", "
        )} ${allInvalidWords.length > 1 ? "are" : "is"} not valid.`
      );
      return false;
    }
    const isValidLength = wordsArray.length === 15; //Only 15 words for now
    if (!isValidLength) {
      setErrorMsg("Seed phrase needs to be 15 words long.");
      return false;
    }
    setErrorMsg("");
    return true;
  };
  const onMnemonicChange = (e) => {
    const newMnemonic = e.target.value;
    setMnemonic(newMnemonic);
    setIsValid(mnemonicValidator(newMnemonic));
  };
  return (
    <div>
      <label>Enter your wallet mnemonic seed phrase</label>
      <input type="text" value={mnemonic} onChange={onMnemonicChange} />
      {errorMsg && <div className="error">{errorMsg}</div>}
    </div>
  );
}
export default EnterMnemonic;
