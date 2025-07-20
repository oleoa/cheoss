import { useState } from "react";
import type { TeamType, Square } from "../interfaces";
import usePieces from "./usePieces";

export default function useChess() {
  const { generateSquares, calculatePiecePossibleMoves } = usePieces();

  const [squares, setSquares] = useState(generateSquares);
  const updateSquare = (currentSquare: Square, newSquare: Square) => {
    setSquares((oldSquares) =>
      oldSquares.map((square) => {
        if (square.id != currentSquare.id) return square;
        return newSquare;
      })
    );
  };

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const clearSelection = () => {
    if (!selectedSquare) return;
    updateSquare(selectedSquare, { ...selectedSquare, selected: false });
    setSelectedSquare(null);
  };

  const [possiblesSquares, setPossibleSquares] = useState<Square[]>([]);
  const setPossibility = (square: Square) => {
    setPossibleSquares((prevPossibilities) => [square, ...prevPossibilities]);
    updateSquare(square, { ...square, possibility: playingTeam });
  };
  const setPossibilities = (possibilities: Square[]) => {
    possibilities.forEach((p) => setPossibility(p));
  };
  const clearPossibilities = () => {
    possiblesSquares.forEach((possibleSquare) => {
      updateSquare(possibleSquare, { ...possibleSquare, possibility: null });
    });
    setPossibleSquares([]);
  };

  const [playingTeam, setPlayingTeam] = useState<TeamType>("bright");
  const switchTeams = () => {
    setPlayingTeam((prevTeam) => (prevTeam == "bright" ? "dark" : "bright"));
  };

  // Function responsible for when the player is setting a new selection for his piece (only chosing, not moving)
  const newSelection = (clickedSquare: Square) => {
    if (!clickedSquare.piece) return;
    if (selectedSquare) clearSelection();
    if (possiblesSquares) clearPossibilities();

    // Select the new square
    setSelectedSquare(clickedSquare);
    updateSquare(clickedSquare, { ...clickedSquare, selected: true });

    // Calculates and shows the player what squares that piece can move to
    const possibilities = calculatePiecePossibleMoves(clickedSquare, squares);
    setPossibilities(possibilities);
  };

  // Function responsible for when the player is trying to move his piece to a new square (not selection, only moving an already selected piece)
  const newMove = (movingSquare: Square) => {
    if (!selectedSquare || !selectedSquare.piece) return;

    // Checks if the piece can move there
    if (!possiblesSquares.map((c) => c.id).includes(movingSquare.id)) return;

    // Removes the piece from the old square and unselect it
    updateSquare(selectedSquare, { ...selectedSquare, selected: false, piece: null });

    // Clears out the possibilities
    clearPossibilities();

    // Move the piece to the new square
    updateSquare(movingSquare, { ...movingSquare, piece: selectedSquare.piece, possibility: null });

    // Unselect the square
    setSelectedSquare(null);

    // Changes the playing team
    switchTeams();
  };

  const click = (square: Square) => {
    // If it's the first time the player is trying to select
    if (selectedSquare === null) {
      // If the player is trying to select a square with no pieces, do nothing
      if (!square.piece) return;

      // If the player is trying to select a piece from the other team, do nothing
      if (square.piece.team != playingTeam) return;

      // Select the new square, calculates and shows the player what squares that piece can move to
      newSelection(square);

      return;
    }

    // If it's the player have selected a square already, checks to see if the square has any piece
    // (Done onyl for typesafety, this won't ever happen (probably))
    if (!selectedSquare.piece) return;

    // If the player is trying to move the piece to the same place, unselect
    if (square.id == selectedSquare.id) {
      clearSelection();
      clearPossibilities();
      return;
    }

    // If the player is trying to move the piece to a piece of his own, unselect it and select the new one
    if (square.piece && square.piece.team == selectedSquare.piece.team) return newSelection(square);

    // If the player is trying to move the piece to a place it can't, unselect
    if (!possiblesSquares.map((p) => p.id).includes(square.id)) {
      clearSelection();
      clearPossibilities();
      return;
    }

    return newMove(square);
  };

  return { squares, click };
}
