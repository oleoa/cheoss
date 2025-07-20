import useChess from "./hooks/useChess";
import Board from "./components/Board";

export default function Chess() {
  const { squares, click } = useChess();
  return <Board squares={squares} click={click} />;
}
