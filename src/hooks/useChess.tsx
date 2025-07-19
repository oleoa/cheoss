import Pawn from "./../components/pieces/Pawn";
import Rook from "./../components/pieces/Rook";
import Knight from "./../components/pieces/Knight";
import Bishop from "./../components/pieces/Bishop";
import Queen from "./../components/pieces/Queen";
import King from "./../components/pieces/King";

import { useState } from "react";
import type { ReactElement } from "react";

type PieceName = "pawn" | "rook" | "bishop" | "knight" | "queen" | "king";
type TeamType = "bright" | "dark";

export interface Square {
  id: string;
  color: TeamType;
  piece: {
    name: PieceName;
    team: string;
    jsx: ReactElement | null;
  } | null;
  selected: boolean;
  possibility: boolean;
}

export default function useChess() {
  const [squares, setSquares] = useState(generateSquares);
  const updateSquare = (currentSquare: Square, newSquare: Square) => {
    setSquares((oldSquares) =>
      oldSquares.map((row, r) =>
        r == 8 - Number(currentSquare.id[1])
          ? row.map((val, c) =>
              c === ["a", "b", "c", "d", "e", "f", "g", "h"].findIndex((column) => column == currentSquare.id[0])
                ? newSquare
                : val
            )
          : row
      )
    );
  };

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const clearSelection = () => {
    if (!selectedSquare) return;
    updateSquare(selectedSquare, { ...selectedSquare, selected: false });
    setSelectedSquare(null);
  };

  const [possiblesSquares, setPossibleSquares] = useState<Square[]>([]);
  const clearPossibilities = () => {
    possiblesSquares.forEach((possibleSquare) => {
      updateSquare(possibleSquare, { ...possibleSquare, possibility: false });
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
    updateSquare(clickedSquare, { ...clickedSquare, selected: !clickedSquare.selected });

    // Calculates and shows the player what squares that piece can move to
    const selectedPieceType = clickedSquare.piece.name;
    const squaresItCanMoveTo = pieceCanMoveToSquares(selectedPieceType, clickedSquare.id);
    console.log(squaresItCanMoveTo);
    squaresItCanMoveTo.forEach((coordinate) => {
      const possibleSquare = getSquareByCoordinates(coordinate, squares);
      if (!possibleSquare) return;
      setPossibleSquares((prev) => [...prev, possibleSquare]);
      updateSquare(possibleSquare, { ...possibleSquare, possibility: true });
    });
  };

  // Function responsible for when the player is trying to move his piece to a new square (not selection, only moving an already selected piece)
  const newMove = (movingSquare: Square) => {
    if (!selectedSquare || !selectedSquare.piece) return;

    // Checks if the piece can move there
    // const selectedPieceType = (selectedSquare.piece as React.ReactElement<PiecesProps>).props.type;
    // console.log(pieceCanMoveToSquares(selectedPieceType, selectedSquare.id));

    // Removes the piece from the old square and unselect it
    updateSquare(selectedSquare, { ...selectedSquare, selected: false, piece: null });

    // Clears out the possibilities
    clearPossibilities();

    // Move the piece to the new square
    updateSquare(movingSquare, { ...movingSquare, piece: selectedSquare.piece, possibility: false });

    // Unselect the square
    setSelectedSquare(null);

    // Changes the playing team
    switchTeams();
  };

  const click = (square: Square) => {
    // If it's the first time the player is trying to select
    if (selectedSquare === null) {
      //

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

    return newMove(square);
  };

  return { squares, click };
}

function generateSquares() {
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const squares: Square[][] = [];

  function generatePieceOrNothing(coordinates: string): { name: PieceName; team: string; jsx: ReactElement } | null {
    if (coordinates[1] == "2" || coordinates[1] == "7")
      return {
        name: "pawn",
        team: coordinates[1] == "2" ? "bright" : "dark",
        jsx: <Pawn team={coordinates[1] == "2" ? "bright" : "dark"} type="pawn" />,
      };
    if (coordinates == "a1" || coordinates == "h1" || coordinates == "a8" || coordinates == "h8")
      return {
        name: "rook",
        team: coordinates[1] == "1" ? "bright" : "dark",
        jsx: <Rook team={coordinates[1] == "1" ? "bright" : "dark"} type="rook" />,
      };
    if (coordinates == "b1" || coordinates == "g1" || coordinates == "b8" || coordinates == "g8")
      return {
        name: "knight",
        team: coordinates[1] == "1" ? "bright" : "dark",
        jsx: <Knight team={coordinates[1] == "1" ? "bright" : "dark"} type="knight" />,
      };
    if (coordinates == "c1" || coordinates == "f1" || coordinates == "c8" || coordinates == "f8")
      return {
        name: "bishop",
        team: coordinates[1] == "1" ? "bright" : "dark",
        jsx: <Bishop team={coordinates[1] == "1" ? "bright" : "dark"} type="bishop" />,
      };
    if (coordinates == "d1" || coordinates == "d8")
      return {
        name: "queen",
        team: coordinates[1] == "1" ? "bright" : "dark",
        jsx: <Queen team={coordinates[1] == "1" ? "bright" : "dark"} type="queen" />,
      };
    if (coordinates == "e1" || coordinates == "e8")
      return {
        name: "king",
        team: coordinates[1] == "1" ? "bright" : "dark",
        jsx: <King team={coordinates[1] == "1" ? "bright" : "dark"} type="king" />,
      };
    return null;
  }

  rows.forEach((row, key) => {
    squares.push([]);
    columns.forEach((column, u) => {
      squares[key].push({
        id: column + row,
        color: (u - key) % 2 == 0 ? "bright" : "dark",
        piece: generatePieceOrNothing(column + row),
        selected: false,
        possibility: false,
      });
    });
  });
  return squares;
}

function getSquareByCoordinates(coordinates: string, squares: Square[][]): Square | null {
  let square: Square | null = null;
  squares.forEach((row: Square[]) => {
    const found = row.find((s: Square) => s.id == coordinates);
    if (found) return (square = found);
  });
  return square;
}

function pieceCanMoveToSquares(piece: PieceName, position: string): string[] {
  if (piece == "pawn") {
    return [position[0] + (Number(position[1]) + 1), position[0] + (Number(position[1]) + 2)];
  }
  return [];
}
