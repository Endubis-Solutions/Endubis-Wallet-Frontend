import {
  generateMnemonic as _generateMnemonic,
  validateMnemonic as _validateMnemonic,
  wordlists,
} from "bip39-light";

import {
  decodePaperWalletMnemonic,
  mnemonicToRootKeypair,
} from "cardano-crypto.js";

const sanitizeMnemonic = (mnemonic) =>
  mnemonic.replace(/,/g, " ").replace(/\s+/g, " ").trim();

function generateMnemonic(wordCount) {
  wordCount = wordCount || 15;

  if (wordCount % 3 !== 0) {
    throw new Error(`Invalid mnemonic word count supplied: ${wordCount}`);
  }

  return _generateMnemonic((32 * wordCount) / 3);
}

function validateMnemonic(mnemonic) {
  try {
    return (
      !!mnemonic &&
      (_validateMnemonic(mnemonic) || validatePaperWalletMnemonic(mnemonic))
    );
  } catch (e) {
    return false;
  }
}

function getValidLastWords(mnemonic) {
  const mnemonicArray = mnemonic.split(" ");
  const isValidLength = [15, 24].includes(mnemonicArray.length); //Only 15 and 24 words for now
  if (isValidLength) {
    const validLastWords = wordlists.EN.filter((word) => {
      mnemonicArray.splice(-1, 1, word);
      return validateMnemonic(mnemonicArray.join(" "));
    });
    return validLastWords;
  } else {
    throw Error("Mnemonic has invalid length");
  }
}

function validatePaperWalletMnemonic(mnemonic) {
  return (
    !!mnemonic &&
    validateMnemonicWords(mnemonic) &&
    isMnemonicInPaperWalletFormat(mnemonic)
  );
}

function isMnemonicInPaperWalletFormat(mnemonic) {
  return mnemonicToList(mnemonic).length === 27;
}

function mnemonicToList(mnemonic) {
  return mnemonic.split(" ");
}

function validateMnemonicWords(mnemonic) {
  const wordlist = wordlists.EN;
  const words = mnemonic.split(" ");

  return words.reduce((result, word) => {
    return result && wordlist.indexOf(word) !== -1;
  }, true);
}

const derivationSchemes = {
  v1: {
    type: "v1",
    ed25519Mode: 1,
    keyfileVersion: "1.0.0",
  },
  v2: {
    type: "v2",
    ed25519Mode: 2,
    keyfileVersion: "2.0.0",
  },
};

const guessDerivationSchemeFromMnemonic = (mnemonic) => {
  return mnemonic.split(" ").length === 12
    ? derivationSchemes.v1
    : derivationSchemes.v2;
};

const mnemonicToWalletSecretDef = async (mnemonic) => {
  if (await isMnemonicInPaperWalletFormat(mnemonic)) {
    mnemonic = await decodePaperWalletMnemonic(mnemonic);
  }

  const derivationScheme = guessDerivationSchemeFromMnemonic(mnemonic);
  const rootSecret = await mnemonicToRootKeypair(
    mnemonic,
    derivationScheme.ed25519Mode
  );

  return {
    rootSecret,
    derivationScheme,
  };
};

export {
  generateMnemonic,
  validateMnemonic,
  validatePaperWalletMnemonic,
  isMnemonicInPaperWalletFormat,
  sanitizeMnemonic,
  mnemonicToWalletSecretDef,
  getValidLastWords,
};
