import { type Square, generateSquares, updateSquare } from "./helpers";
type SelectedSquareType = null | Square;
type PlayingTeamType = "bright" | "dark";
type PieceProps = { team: "bright" | "dark" };
import { useState } from "react";

import Board from "./components/Board";

export default function Chess() {
  const [squares, setSquares] = useState(generateSquares);
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquareType>(null);
  const [playingTeam, setPlayingTeam] = useState<PlayingTeamType>("bright");

  const click = (square: Square) => {
    // If it's null, selects a square and tries to saves it
    // If it's not null, tries to move the piece from the selected square to that new square
    if (selectedSquare === null) {
      // If the player is trying to select a square with no pieces, do nothing
      if (!square.piece) return;

      // If the player is trying to select a piece from the other team, do nothing
      if ((square.piece as React.ReactElement<PieceProps>).props.team != playingTeam) return;

      // Select the new square
      setSelectedSquare(square);
      updateSquare(square, setSquares, { ...square, selected: !square.selected });
    } else {
      // If the player is trying to move the piece to the same place, unselect
      if (square.id == selectedSquare.id) {
        updateSquare(selectedSquare, setSquares, { ...selectedSquare, selected: false });
        setSelectedSquare(null);
        return;
      }

      // If the player is trying to move the piece to a piece of his own, unselect it and select the new one
      if (
        square.piece &&
        (square.piece as React.ReactElement<PieceProps>).props.team ==
          (selectedSquare.piece as React.ReactElement<PieceProps>).props.team
      ) {
        // Unselect the old square
        updateSquare(selectedSquare, setSquares, { ...selectedSquare, selected: false });

        // Select the new square
        setSelectedSquare(square);
        updateSquare(square, setSquares, { ...square, selected: !square.selected });
        return;
      }

      // Removes the piece from the old square and unselect it
      updateSquare(selectedSquare, setSquares, { ...selectedSquare, selected: false, piece: null });

      // Move the piece to the new square
      updateSquare(square, setSquares, { ...square, piece: selectedSquare.piece });

      // Unselect the square
      setSelectedSquare(null);

      // Changes team
      setPlayingTeam((prevTeam) => (prevTeam == "bright" ? "dark" : "bright"));
    }
  };

  return <Board squares={squares} click={click} />;
}
