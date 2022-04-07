import { bech32 } from "cardano-crypto.js";

const HARDENED_THRESHOLD = 2147483648;

const getAccountPublicKey = async (cryptoProvider, accountIndex = 0) => {
  const accountPath = [
    HARDENED_THRESHOLD + 1852,
    HARDENED_THRESHOLD + 1815,
    HARDENED_THRESHOLD + accountIndex,
  ];
  const accountXpub = await cryptoProvider.deriveXpub(accountPath);
  return bech32.encode("endbs", accountXpub);
};
export default getAccountPublicKey;
