import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { generateMnemonic } from "../utils/newWalletTools/helpers/mnemonicHelpers";

const StyledCreateMnemonic = styled.div`
  text-align: center;
`;

const Disclaimer = styled.div`
  padding: 1rem;
`;

const Mnemonic = styled.p`
  padding: 2rem;

  border: 1px solid var(--color-border, grey);
  text-align: left;
`;
export default function CreateMnemonic({ setIsValid }) {
  const [mnemonic, setMnemonic] = useState(null);

  const handleGenerate = () => {
    setMnemonic(generateMnemonic(15));
  };

  useEffect(() => {
    setIsValid(!!mnemonic);
  }, [mnemonic]);

  return (
    <StyledCreateMnemonic className="flow-content">
      {mnemonic && <Mnemonic>{mnemonic}</Mnemonic>}
      <button onClick={handleGenerate}>
        {!mnemonic ? "Click Here to  " : ""}Generate{" "}
        {mnemonic ? "Another " : "a "}Seed Phrase
      </button>
      {mnemonic && (
        <>
          <Disclaimer>
            <b>
              Write the mnemonic phrase down, you will need it to access your
              wallet. Don’t copy it to your clipboard or save it anywhere
              online.
            </b>
          </Disclaimer>
          <p>Press Next once you have done so.</p>
        </>
      )}
    </StyledCreateMnemonic>
  );
}
