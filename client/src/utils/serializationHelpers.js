import { mnemonicToEntropy } from "bip39";
import {
  Bip32PrivateKey,
  hash_transaction,
  make_vkey_witness,
  Transaction,
  TransactionWitnessSet,
  Vkeywitnesses,
  TransactionBody,
} from "cardano-serialization-lib-asmjs/cardano_serialization_lib";

export class Seed {
  static sign(txBody, privateKeys, transactionMetadata) {
    const txHash = hash_transaction(txBody);
    const witnesses = TransactionWitnessSet.new();
    const vkeyWitnesses = Vkeywitnesses.new();
    if (privateKeys) {
      privateKeys.forEach((prvKey) => {
        // add keyhash witnesses
        const vkeyWitness = make_vkey_witness(txHash, prvKey);
        vkeyWitnesses.add(vkeyWitness);
      });
    }
    witnesses.set_vkeys(vkeyWitnesses);

    const transaction = Transaction.new(txBody, witnesses, transactionMetadata);

    return transaction;
  }

  static harden(num) {
    return 0x80000000 + num;
  }

  static deriveRootKey(phrase) {
    let mnemonic = Array.isArray(phrase) ? phrase.join(" ") : phrase;
    const entropy = mnemonicToEntropy(mnemonic);
    const rootKey = Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(entropy, "hex"),
      Buffer.from("")
    );
    return rootKey;
  }

  static deriveKey(key, path) {
    let result = key;
    path.forEach((p) => {
      result = result.derive(
        p.endsWith("H") || p.endsWith("'")
          ? Seed.harden(Number.parseInt(p.substr(0, p.length - 1)))
          : Number.parseInt(p)
      );
    });

    return result;
  }

  static getSigningKeys = (coinSelection, rootKey) => {
    return coinSelection.inputs.map((i) => {
      let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
      return privateKey;
    });
  };

  static getSignedTxBody = (txBuild, signingKeys) => {
    return Seed.sign(txBuild, signingKeys);
  };

  static txBodyToHex = (txBody) => {
    return Buffer.from(txBody.to_bytes()).toString("hex");
  };

  static txBodyFromHex = (txHex) => {
    return TransactionBody.from_bytes(Buffer.from(txHex, "hex"));
  };
}

export const getSignedTxHex = (unsignedTxHex, coinSelection, mnemonic) => {
  const unsignedTxBody = Seed.txBodyFromHex(unsignedTxHex);
  const rootKey = Seed.deriveRootKey(mnemonic);
  const signingKeys = Seed.getSigningKeys(coinSelection, rootKey);
  const signedTxBody = Seed.getSignedTxBody(unsignedTxBody, signingKeys);
  return Seed.txBodyToHex(signedTxBody);
};
