function Confirmation({ result }) {
  return <>{result ? <h1>{result}</h1> : <h1>Loading...</h1>}</>;
}
export default Confirmation;
