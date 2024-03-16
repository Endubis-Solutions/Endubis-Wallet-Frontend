const NetworkId = {
  MAINNET: 1,
  TESTNET: 0,
};

const getConfig = (derivationScheme) => ({
  shouldExportPubKeyBulk: false,
  isShelleyCompatible: !(derivationScheme.type === "v1"),
  network: {
    networkId: NetworkId.MAINNET,
  },
});

export default getConfig;
