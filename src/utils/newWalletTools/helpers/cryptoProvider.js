import {
  derivePublic as deriveChildXpub,
  derivePrivate,
} from "cardano-crypto.js";

import { Buffer } from "buffer";

const derivedXpubs = {};
const HARDENED_THRESHOLD = 2147483648;
const BYRON_V2_PATH = [
  HARDENED_THRESHOLD + 44,
  HARDENED_THRESHOLD + 1815,
  HARDENED_THRESHOLD,
];
const getCryptoProvider = async ({
  walletSecretDef: { rootSecret, derivationScheme },
  config,
}) => {
  const masterHdNode = HdNode(rootSecret);

  const getType = () => "WALLET_SECRET";
  const getWalletSecret = () => masterHdNode.toBuffer();
  const getDerivationScheme = () => derivationScheme;
  const getVersion = () => null;
  function isFeatureSupported(feature) {
    return feature !== "POOL_OWNER";
  }

  function _HdNode({ secretKey, publicKey, chainCode }) {
    /**
     * HD node groups secretKey, publicKey and chainCode
     * can be initialized from Buffers or single string
     * @param secretKey as Buffer
     * @param publicKey as Buffer
     * @param chainCode as Buffer
     */

    const extendedPublicKey = Buffer.concat([publicKey, chainCode], 64);

    function toBuffer() {
      return Buffer.concat([secretKey, extendedPublicKey]);
    }

    function toString() {
      return toBuffer().toString("hex");
    }

    return {
      secretKey,
      publicKey,
      chainCode,
      extendedPublicKey,
      toBuffer,
      toString,
    };
  }

  function HdNode(secret) {
    const secretKey = secret.slice(0, 64);
    const publicKey = secret.slice(64, 96);
    const chainCode = secret.slice(96, 128);
    return _HdNode({ secretKey, publicKey, chainCode });
  }

  const HARDENED_THRESHOLD = 2147483648;

  const indexIsHardened = (index) => index >= HARDENED_THRESHOLD;
  const isShelleyPath = (path) => path[0] - HARDENED_THRESHOLD === 1852;

  function deriveChildHdNode(hdNode, childIndex) {
    const result = derivePrivate(
      hdNode.toBuffer(),
      childIndex,
      derivationScheme.ed25519Mode
    );

    return HdNode(result);
  }

  function deriveHdNode(derivationPath) {
    return derivationPath.reduce(deriveChildHdNode, masterHdNode);
  }

  const deriveXpub = CachedDeriveXpubFactory(
    masterHdNode.derivationScheme,
    config.shouldExportPubKeyBulk,
    (derivationPaths) => {
      return derivationPaths.map(
        (path) => deriveHdNode(path).extendedPublicKey
      );
    }
  );

  function CachedDeriveXpubFactory(
    derivationScheme,
    shouldExportPubKeyBulk,
    deriveXpubsHardenedFn,
    shouldIncludeByronPath = true
  ) {
    async function deriveXpub(absDerivationPath) {
      const memoKey = JSON.stringify(absDerivationPath);

      if (!derivedXpubs[memoKey]) {
        const deriveHardened =
          absDerivationPath.length === 0 ||
          indexIsHardened(absDerivationPath.slice(-1)[0]);

        /*
         * we create pubKeyBulk only if the derivation path is from shelley era
         * since there should be only one byron account exported in the fist shelley pubKey bulk
         */

        if (deriveHardened) {
          const derivationPaths =
            shouldExportPubKeyBulk && isShelleyPath(absDerivationPath)
              ? createPathBulk(absDerivationPath)
              : [absDerivationPath];
          const pubKeys = await _deriveXpubsHardenedFn(derivationPaths);
          Object.assign(derivedXpubs, pubKeys);
        } else {
          derivedXpubs[memoKey] = await deriveXpubNonhardenedFn(
            absDerivationPath
          );
        }
      }

      /*
       * we await the derivation of the key so in case the derivation fails
       * the key is not added to the cache
       * this approach depends on the key derivation happening sychronously
       */

      return derivedXpubs[memoKey];
    }

    async function deriveXpubNonhardenedFn(derivationPath) {
      const lastIndex = derivationPath.slice(-1)[0];
      const parentXpub = await deriveXpub(derivationPath.slice(0, -1));
      return deriveChildXpub(
        parentXpub,
        lastIndex,
        derivationScheme.ed25519Mode
      );
    }

    function* makeBulkAccountIndexIterator() {
      yield [0, 4];
      yield [5, 16];
      for (let i = 17; true; i += 18) {
        yield [i, i + 17];
      }
    }

    function getAccountIndexExportInterval(accountIndex) {
      const bulkAccountIndexIterator = makeBulkAccountIndexIterator();
      for (const [startIndex, endIndex] of bulkAccountIndexIterator) {
        if (accountIndex >= startIndex && accountIndex <= endIndex) {
          return [startIndex, endIndex];
        }
      }
      throw new Error("Bulk Export Creation Error");
    }

    function createPathBulk(derivationPath) {
      const paths = [];
      const accountIndex = derivationPath[2] - HARDENED_THRESHOLD;
      const [startIndex, endIndex] =
        getAccountIndexExportInterval(accountIndex);

      for (let i = startIndex; i <= endIndex; i += 1) {
        const nextAccountIndex = i + HARDENED_THRESHOLD;
        const nextAccountPath = [
          ...derivationPath.slice(0, -1),
          nextAccountIndex,
        ];
        paths.push(nextAccountPath);
      }

      /*
       * in case of the account 0 we append also the byron path
       * since during byron era only the first account was used
       */
      if (
        shouldIncludeByronPath &&
        accountIndex === 0 &&
        !paths.includes(BYRON_V2_PATH)
      ) {
        paths.push(BYRON_V2_PATH);
      }
      return paths;
    }

    /*
     * on top of the original deriveXpubHardenedFn this is priming
     * the cache of derived keys to minimize the number of prompts on hardware wallets
     */
    async function _deriveXpubsHardenedFn(derivationPaths) {
      const xPubBulk = await deriveXpubsHardenedFn(derivationPaths);
      const _derivedXpubs = {};
      xPubBulk.forEach((xpub, i) => {
        const memoKey = JSON.stringify(derivationPaths[i]);
        _derivedXpubs[memoKey] = xpub;
      });
      return _derivedXpubs;
    }

    return deriveXpub;
  }
  return {
    getType,
    getWalletSecret,
    getDerivationScheme,
    getVersion,
    isFeatureSupported,
    deriveXpub,
    network: config.network,
  };
};

export default getCryptoProvider;
