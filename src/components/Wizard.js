import styled from "@emotion/styled";
import { Children, useState } from "react";

const WizardWindow = styled.div`
  max-width: 900px;
  padding: 1rem;
  margin: 0 auto;
  /* outline: 1px solid red; */
`;

const WizardButton = styled.button`
  font-size: 20px;
  font-weight: 200;
  letter-spacing: 1px;
  padding: 0.4rem 1.6rem 0.4rem;
  outline: 0;
  border: 1px solid black;
  cursor: pointer;
  position: relative;
  background-color: rgba(0, 0, 0, 0);
  &::after {
    content: "";
    background-color: #5ece7b;
    width: 100%;
    z-index: -1;
    position: absolute;
    height: 100%;
    top: 7px;
    left: 7px;
  }
  &:disabled {
    cursor: not-allowed;
  }
  &:disabled::after {
    background-color: rgba(16, 16, 16, 0.3);
    color: rgba(16, 16, 16, 0.3);
    border-color: rgba(16, 16, 16, 0.3);
  }
`;
const ButtonContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 1rem;
  justify-content: space-between;
  .next {
    margin-left: auto;
  }
  .back {
    margin-right: auto;
  }
`;

function Wizard({ children = {}, noPrevOnFinalStep, onSubmit }) {
  const childrenArray = Children.toArray(children);
  const stepCount = childrenArray.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const onPrev = () => {
    setCurrentIndex((step) => step - 1);
  };

  const onNext = () => {
    if (currentIndex === stepCount - 2) {
      onSubmit();
    }
    if (currentPage.props.isValid) {
      setCurrentIndex((step) => step + 1);
    } else if (currentPage.props.isValid === undefined) {
      throw `No validation set for ${currentPage.type.name}. Please set an isValid prop`;
    }
  };
  const currentPage = childrenArray[currentIndex];
  const showPrev =
    (!noPrevOnFinalStep && currentIndex > 0) ||
    (noPrevOnFinalStep && currentIndex > 0 && currentIndex !== stepCount - 1);

  const notFinalIndex = stepCount - 1 > currentIndex;
  return (
    <WizardWindow>
      <div>{currentPage}</div>
      <ButtonContainer>
        {showPrev && (
          <WizardButton className="back" onClick={onPrev}>
            Back
          </WizardButton>
        )}
        {notFinalIndex && (
          <WizardButton
            className="next"
            onClick={onNext}
            disabled={!currentPage.props.isValid}
          >
            Next
          </WizardButton>
        )}
      </ButtonContainer>
    </WizardWindow>
  );
}
export default Wizard;
