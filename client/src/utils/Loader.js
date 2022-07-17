let cardanoWasm = null;

export const loadCardanoWasm = async () => {
  if (cardanoWasm) {
    return cardanoWasm;
  }

  cardanoWasm = await import(
    "cardano-serialization-lib-asmjs/cardano_serialization_lib"
  );
  return cardanoWasm;
};

export default loadCardanoWasm;
