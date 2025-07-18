/* eslint-disable @typescript-eslint/no-explicit-any */

import Pawn from "./components/pieces/Pawn";
import Rook from "./components/pieces/Rook";
import Knight from "./components/pieces/Knight";
import Bishop from "./components/pieces/Bishop";
import Queen from "./components/pieces/Queen";
import King from "./components/pieces/King";

export function generateSquares() {
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];
  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const squares: any[][] = [];
  rows.forEach((row, key) => {
    squares.push([]);
    columns.forEach((column, u) => {
      squares[key].push({
        id: column + row,
        color: (u - key) % 2 == 0 ? "bright" : "dark",
        piece: piece(column + row),
      });
    });
  });
  return squares;
}

function piece(coordinates: string) {
  if (coordinates[1] == "2" || coordinates[1] == "7") return <Pawn />;
  if (coordinates == "a1" || coordinates == "h1" || coordinates == "a8" || coordinates == "h8") return <Rook />;
  if (coordinates == "b1" || coordinates == "g1" || coordinates == "b8" || coordinates == "g8") return <Knight />;
  if (coordinates == "c1" || coordinates == "f1" || coordinates == "c8" || coordinates == "f8") return <Bishop />;
  if (coordinates == "d1" || coordinates == "d8") return <Queen />;
  if (coordinates == "e1" || coordinates == "e8") return <King />;
  return "";
}
