import {
  validateMnemonic,
  mnemonicToWalletSecretDef,
} from "./helpers/mnemonicHelpers";
import getConfig from "./config";
import getCryptoProvider from "./helpers/cryptoProvider";

import getAccountPublicKey from "./helpers/keyGenerator";

export const mnemonicToXpub = async (mnemonic) => {
  const sanitizedMnemonic = mnemonic;
  const isValid = validateMnemonic(sanitizedMnemonic);
  if (!isValid) {
    throw Error("Invalid Mnemonic Input");
  }
  const walletSecretDef = await mnemonicToWalletSecretDef(sanitizedMnemonic);
  const config = getConfig(walletSecretDef.derivationScheme);
  const cryptoProvider = await getCryptoProvider({ walletSecretDef, config });

  const accountXpubBech32 = await getAccountPublicKey(cryptoProvider);
  return accountXpubBech32;
};
