import { Children, useState } from "react";

function Wizard({ children = {}, noPrevOnFinalStep }) {
  const childrenArray = Children.toArray(children);
  const stepCount = childrenArray.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const onPrev = () => {
    setCurrentIndex((step) => step - 1);
  };

  const onNext = () => {
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
  return (
    <div>
      <div>{currentPage}</div>
      {showPrev && <button onClick={onPrev}>Previous</button>}
      {stepCount - 1 > currentIndex && (
        <button onClick={onNext} disabled={!currentPage.props.isValid}>
          Next
        </button>
      )}
    </div>
  );
}
export default Wizard;
