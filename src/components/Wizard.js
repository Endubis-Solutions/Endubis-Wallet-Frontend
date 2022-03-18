import { Children, useState } from "react";

function Wizard({ children = {} }) {
  const childrenArray = Children.toArray(children);
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
  return (
    <div>
      <div>{currentPage}</div>
      {currentIndex > 0 && <button onClick={onPrev}>Previous</button>}
      {childrenArray.length - 1 > currentIndex && (
        <button onClick={onNext} disabled={!currentPage.props.isValid}>
          Next
        </button>
      )}
    </div>
  );
}
export default Wizard;
