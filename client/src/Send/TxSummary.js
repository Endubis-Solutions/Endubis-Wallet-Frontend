import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { getTxDataFromSession } from "../utils/firestore";

const StyledSummary = styled.div`
  text-align: center;
  h1 {
    font-size: 2rem;
    font-weight: 400;
  }
  .txsummary {
    font-size: 18px;
    border: 1px solid var(--dark, black);
    padding: 1rem;
    & > * {
      --flow-spacer: 0.5rem;
    }
    text-align: left;
    display: inline-block;

    .time {
      font-size: 16px;
      text-align: right;
      font-weight: 300;
    }
  }
`;

function TxSummary({ unsignedTx, loading }) {
  return (
    <StyledSummary className="flow-content">
      {unsignedTx ? (
        <>
          <h1>Transaction Summary</h1>
          <div className="txsummary flow-content">
            <div>
              <span>Your Available balance: </span>
              <b>{unsignedTx.balance / 1000000} ada</b>
              <div className="time">
                as of {new Date(unsignedTx.time).toUTCString()}
              </div>
            </div>
            <p>
              <span>Amount to Send: </span>
              <b>{unsignedTx.amount / 1000000} ada</b>
            </p>
            <p>
              <span>Fee: </span>
              <b>{unsignedTx.fee / 1000000} ada</b>
            </p>
          </div>
          <p>
            <i>Press Next to Continue</i>
          </p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : (
        <h1>Invalid Link</h1>
      )}
    </StyledSummary>
  );
}
export default TxSummary;

// Your Available balance: ${
//   wallet.balance.available.quantity / 1000000
// } ada
// Amount to Send: ${amount / 1000000} ada
// Est. Fees: ${txBuild.fee().to_str() / 1000000} ada`,
