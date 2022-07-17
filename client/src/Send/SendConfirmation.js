import styled from "@emotion/styled";
import { useState } from "react";

const StyledConfirmation = styled.div`
  text-align: center;
  h1 {
    font-size: 2rem;
    font-weight: 400;
  }
`;

function SendConfirmation({ result }) {
  return (
    <StyledConfirmation className="flow-content">
      {result.type === "success" ? (
        <>
          <h1>Transaction signed and submitted</h1>
          <p>{JSON.stringify(result.data)}</p>
          <p>
            <b>Await results on telegram any second.</b>
          </p>
          <p>You can now close this tab.</p>
        </>
      ) : result.type === "error" ? (
        <>
          <h1>🔴 There was an error</h1>
          <p>{JSON.stringify(result.data)}</p>
          <div>
            <p>
              <b>Please try again from your telegram wallet.</b>
            </p>
            <p>If the problem persists, contact us</p>
          </div>
        </>
      ) : (
        <>
          <h1>Loading...</h1>
          {/* <p>This may take a minute or two.</p> */}
        </>
      )}
    </StyledConfirmation>
  );
}
export default SendConfirmation;
