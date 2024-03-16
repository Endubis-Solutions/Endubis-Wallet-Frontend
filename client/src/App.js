import React from "react";
import RestoreWallet from "./RestoreWallet";
import Broadcast from "./Broadcast";
import styled from "@emotion/styled";
import { Global, css } from "@emotion/react";
import Send from "./Send";
import logo from "./assets/logo.png";

const GlobalStyles = css`
  :root {
    --text: #43464e;
    --ff-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    --transition-easing: "ease-in-out";
    --transition-time: 0.25s;
    --color-border: #c6e6e6;
  }

  /* RESETS */

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body,
  h1,
  h2,
  h3,
  h4,
  p {
    padding: 0;
    margin: 0;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  button {
    border: 1px solid var(--color-border, grey);
    margin: 0;
    padding: 5px 10px;
    background: transparent;
    color: inherit;
    font: inherit;
  }

  button:hover {
    cursor: pointer;
  }

  /* General Styles */
  body {
    font-family: var(--ff-main);
    color: var(--text);
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
  input,
  select {
    font-size: 16px;
  }
  main {
  }

  /* Utility Classes */

  .input {
    border-radius: 4px;
    border: 1px solid var(--color-border);
    padding: 12px 16px;
    font-size: 14px;
    font-family: var(--ff-main, sans-serif);
    line-height: 32px;
    color: var(--color-text);
    background-color: white;
    transition: border-color var(--transition-easing) var(--transition-time),
      box-shadow var(--transition-easing) var(--transition-time);
  }

  .input:focus {
    outline: none;
    box-shadow: 0 4px 10px 0 rgb(0 0 0 / 6%);
  }

  .fullwidth {
    width: 100%;
  }

  .checkbox {
    margin-right: 10px;
  }
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
  .split {
    display: flex;
  }
  .split > * + * {
    margin-left: var(--flex-spacer, 1rem);
  }
  .split-column {
    display: flex;
    flex-direction: column;
  }
  .split-column > * + * {
    margin-top: var(--flex-spacer, 1rem);
  }
  .flow-content > * + * {
    margin-top: var(--flow-spacer, 1rem);
  }
`;
const MainHeader = styled.header`
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 2rem;
  h1 {
    font-size: 40px;
    font-weight: 200;
    letter-spacing: 1px;
  }
`;
const PageNotFound = styled.div`
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 2rem;
  h1 {
    font-size: 40px;
    font-weight: 200;
    letter-spacing: 1px;
  }
`;
function App() {
  const hasSessionKey = !!new URLSearchParams(window.location.search).get(
    "sessionKey"
  );
  const subUrl = window.location.href.split("?")[0].split("/").pop();
  return (
    <>
      <Global styles={GlobalStyles} />
      <MainHeader className="App-header">
        <h1>
          <img src={logo} alt="Endubis logo" /> Endubis Wallet
        </h1>
      </MainHeader>
      <main>
        {subUrl === 'admin-broadcast' ? (
          <Broadcast />
        ) : hasSessionKey && subUrl === "restore" ? (
          <RestoreWallet />
        ) : hasSessionKey && subUrl === "create" ? (
          <RestoreWallet showCreate={true} />
        ) : hasSessionKey && subUrl === "send" ? (
          <Send />
        ) : (
          <PageNotFound>
            <h1>404: Page Not Found</h1>
          </PageNotFound>
        )}
      </main>
    </>
  );
}

export default App;
