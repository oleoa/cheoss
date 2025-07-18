import { type Square, generateSquares, updateSquare } from "./helpers";
type SelectedSquareType = null | Square;
import { useState } from "react";

import Board from "./components/Board";

export default function Chess() {
  const [squares, setSquares] = useState(generateSquares);
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquareType>(null);
  console.log(selectedSquare);

  const click = (square: Square) => {
    // If it's null, selects a square and tries to saves i
    // If it's not null, tries to move the piece from the selected square to that new square
    if (selectedSquare === null) {
      // If the player is trying to select a square with no pieces, do nothing
      if (!square.piece) return;

      setSelectedSquare(square);
      updateSquare(square, setSquares, { ...square, selected: !square.selected });
    } else {
      // If the player is trying to move the piece to the same place, unselect
      if (square.id == selectedSquare.id) {
        updateSquare(selectedSquare, setSquares, { ...selectedSquare, selected: false });
        setSelectedSquare(null);
        return;
      }

      updateSquare(square, setSquares, { ...square, piece: selectedSquare.piece });
      updateSquare(selectedSquare, setSquares, { ...selectedSquare, selected: false, piece: null });
      setSelectedSquare(null);
    }
  };

  return <Board squares={squares} click={click} />;
}
