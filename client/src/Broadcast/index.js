import { useState, useEffect } from "react";
import { getUsersCount } from "../utils/firestore";
import styled from "@emotion/styled";
import { WizardButton as EndubisButton } from "../components/Wizard";

const backendConnectURL = "https://endubis-frontend.onrender.com/broadcast";
const SpacedOut = styled.div`
  padding: 0 2rem;
  & > * + * {
    margin-top: 1rem;
  }

  .usercount {
    margin-top: 3rem;
    padding: 2rem;
    border: 1px solid green;
  }
`;

function Broadcast() {
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastPass, setBroadcastPass] = useState("");
  const [result, setResult] = useState("");
  const [userCount, setUserCount] = useState(null);

  const sendToBackend = async (broadcastText, broadcastPass) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ broadcastText, broadcastPass }),
    };

    const res = await fetch(backendConnectURL, requestOptions);
    return res;
  };

  const onBroadcastSubmit = async () => {
    const res = await sendToBackend(broadcastText, broadcastPass);
    if (res.status === 200) {
      setResult("Broadcast sent!");
    } else if (res.status === 401) {
      setResult("Wrong passphrase");
    } else {
      setResult("ERROR");
    }
  };

  useEffect(() => {
    getUsersCount().then((count) => {
      setUserCount(count);
    });
  }, []);

  return (
    <>
      <SpacedOut>
        <h1 className="broadcast-title">
          &#128264;&#128264; Broadcast a Message 
        </h1>
        <div>
          <label htmlFor="broadcast-text">Message to broadcast: </label>
          <textarea
            className="input fullwidth"
            id="broadcast-text"
            value={broadcastText}
            onChange={(e) => {
              setBroadcastText(e.target.value);
              setResult("");
            }}
          />
        </div>
        <div>
          <label htmlFor="broadcast-pass">Broadcast passphrase: </label>
          <input
            type="password"
            id="broadcast-pass"
            value={broadcastPass}
            onChange={(e) => {
              setBroadcastPass(e.target.value);
              setResult("");
            }}
          />
        </div>
        <EndubisButton
          onClick={onBroadcastSubmit}
          disabled={!broadcastText || !broadcastPass}
        >
          Broadcast
        </EndubisButton>
        {result && <p>{result}</p>}
        {userCount !== null && (
          <p className="usercount">
            Total unique bot registered accounts: {userCount}
          </p>
        )}
      </SpacedOut>
    </>
  );
}

export default Broadcast;
