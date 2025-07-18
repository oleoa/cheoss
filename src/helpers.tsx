import type { ReactElement } from "react";
type SetSquaresType = React.Dispatch<React.SetStateAction<Square[][]>>;
export interface Square {
  id: string;
  color: "bright" | "dark";
  piece: null | ReactElement;
  selected: boolean;
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
      });
    });
  });
  return squares;
}

function piece(coordinates: string) {
  if (coordinates[1] == "2" || coordinates[1] == "7") return <Pawn team={coordinates[1] == "2" ? "bright" : "dark"} />;
  if (coordinates == "a1" || coordinates == "h1" || coordinates == "a8" || coordinates == "h8")
    return <Rook team={coordinates[1] == "1" ? "bright" : "dark"} />;
  if (coordinates == "b1" || coordinates == "g1" || coordinates == "b8" || coordinates == "g8")
    return <Knight team={coordinates[1] == "1" ? "bright" : "dark"} />;
  if (coordinates == "c1" || coordinates == "f1" || coordinates == "c8" || coordinates == "f8")
    return <Bishop team={coordinates[1] == "1" ? "bright" : "dark"} />;
  if (coordinates == "d1" || coordinates == "d8") return <Queen team={coordinates[1] == "1" ? "bright" : "dark"} />;
  if (coordinates == "e1" || coordinates == "e8") return <King team={coordinates[1] == "1" ? "bright" : "dark"} />;
  return null;
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
