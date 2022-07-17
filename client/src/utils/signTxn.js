import { mnemonicToEntropy } from "bip39";
import loadCardanoWasm from "./Loader";

function harden(num) {
  return 0x80000000 + num;
}

const signTxn = async (mnemonic, txBody) => {
  const cardanoWasm = await loadCardanoWasm();
  const entropy = mnemonicToEntropy(mnemonic);
  const rootKey = cardanoWasm.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, "hex"),
    Buffer.from("")
  );
  const accountKey = rootKey
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type
    .derive(harden(0)); // account #0

  const txHash = cardanoWasm.hash_transaction(txBody);
  const witnesses = cardanoWasm.TransactionWitnessSet.new();
};
