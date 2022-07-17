import styled from "@emotion/styled";

const StyledConfirmation = styled.div`
  text-align: center;
  h1 {
    font-size: 2rem;
    font-weight: 400;
  }
`;

function Confirmation({ result }) {
  return (
    <StyledConfirmation className="flow-content">
      {result === "success" ? (
        <>
          <h1>🎉 Your wallet was restored successfully</h1>
          <p>
            <b>You should get a message on telegram any second.</b>
          </p>
          <p>You can now close this tab.</p>
        </>
      ) : result === "error" ? (
        <>
          <h1>🔴 There was an error</h1>
          <div>
            <p>
              <b>Please try again from your telegram wallet.</b>
            </p>
            <p>If the problem persists, contact us</p>
          </div>
        </>
      ) : (
        <>
          <h1>Loading your wallet...</h1>
          <p>This may take a minute or two.</p>
        </>
      )}
    </StyledConfirmation>
  );
}
export default Confirmation;
