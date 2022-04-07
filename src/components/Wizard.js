import { Children, useState } from "react";

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
    <div>
      <div>{currentPage}</div>
      {showPrev && <button onClick={onPrev}>Back</button>}
      {notFinalIndex && (
        <button onClick={onNext} disabled={!currentPage.props.isValid}>
          Next
        </button>
      )}
    </div>
  );
}
export default Wizard;
