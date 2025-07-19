import type { ReactElement } from "react";
type SetSquaresType = React.Dispatch<React.SetStateAction<Square[][]>>;
export interface Square {
  id: string;
  color: "bright" | "dark";
  piece: null | ReactElement;
  selected: boolean;
  possibility: boolean;
}

type PieceType = "pawn" | "rook" | "bishop" | "knight" | "queen" | "king";
export interface PiecesProps {
  type: PieceType;
  team: "bright" | "dark";
}

import Pawn from "./components/pieces/Pawn";
import Rook from "./components/pieces/Rook";
import Knight from "./components/pieces/Knight";
import Bishop from "./components/pieces/Bishop";
import Queen from "./components/pieces/Queen";
import King from "./components/pieces/King";

export function generateSquares() {
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const squares: Square[][] = [];
  rows.forEach((row, key) => {
    squares.push([]);
    columns.forEach((column, u) => {
      squares[key].push({
        id: column + row,
        color: (u - key) % 2 == 0 ? "bright" : "dark",
        piece: piece(column + row),
        selected: false,
        possibility: false,
      });
    });
  });
  return squares;
}

function piece(coordinates: string) {
  if (coordinates[1] == "2" || coordinates[1] == "7")
    return <Pawn team={coordinates[1] == "2" ? "bright" : "dark"} type="pawn" />;
  if (coordinates == "a1" || coordinates == "h1" || coordinates == "a8" || coordinates == "h8")
    return <Rook team={coordinates[1] == "1" ? "bright" : "dark"} type="rook" />;
  if (coordinates == "b1" || coordinates == "g1" || coordinates == "b8" || coordinates == "g8")
    return <Knight team={coordinates[1] == "1" ? "bright" : "dark"} type="knight" />;
  if (coordinates == "c1" || coordinates == "f1" || coordinates == "c8" || coordinates == "f8")
    return <Bishop team={coordinates[1] == "1" ? "bright" : "dark"} type="bishop" />;
  if (coordinates == "d1" || coordinates == "d8")
    return <Queen team={coordinates[1] == "1" ? "bright" : "dark"} type="queen" />;
  if (coordinates == "e1" || coordinates == "e8")
    return <King team={coordinates[1] == "1" ? "bright" : "dark"} type="king" />;
  return null;
}

export function getSquareByCoordinates(coordinates: string, squares: Square[][]): Square | null {
  let square: Square | null = null;
  squares.forEach((row: Square[]) => {
    const found = row.find((s: Square) => s.id == coordinates);
    if (found) return (square = found);
  });
  return square;
}

export function updateSquare(square: Square, setSquares: SetSquaresType, newSquare: Square) {
  setSquares((oldSquares) =>
    oldSquares.map((row, r) =>
      r == 8 - Number(square.id[1])
        ? row.map((val, c) =>
            c === ["a", "b", "c", "d", "e", "f", "g", "h"].findIndex((column) => column == square.id[0])
              ? newSquare
              : val
          )
        : row
    )
  );
}

export function color(team: "bright" | "dark") {
  return team == "bright" ? "rgb(100,100,255)" : "rgb(158,181,158)";
}

export function pieceCanMoveToSquares(piece: PieceType, position: string): string[] {
  if (piece == "pawn") {
    return [position[0] + (Number(position[1]) + 1), position[0] + (Number(position[1]) + 2)];
  }
  return [];
}
