import type { RowType, ColumnType, Square, PieceName, TeamType } from "../interfaces";
import type { ReactElement } from "react";
import { Piece } from "../components/Piece";

const rows: RowType[] = [8, 7, 6, 5, 4, 3, 2, 1];
const columns: ColumnType[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function usePieces() {
  // The most complex function on the project
  // It should calculate, for each piece, what squares it can move in to
  // It should take in consideration wheter or not it would put the king in check
  // That is, moving to a square under attack, undescovered check or not leaving from a check
  const calculatePiecePossibleMoves = (square: Square, squares: Square[]): Square[] => {
    if (!square || !square.piece) return [];

    const possibilities: Square[] = [];
    const playingTeam = square.piece.team;
    const oppositeTeam = ["bright", "dark"].filter((t) => t != playingTeam)[0];

    // Function will get a snapshot of the board for each possible move and will search
    // for any checks against the team's king
    // const checkIfItsInCheck = (squares: Square[][], team: TeamType): boolean[] => {
    //   const targetingSquares: Square[] = [];

    //   squares.forEach((row) => {
    //     const enemyPiecesSquares = row.filter((s) => s.piece?.team == oppositeTeam);
    //     console.log(enemyPiecesSquares);
    //     return;
    //     const squareRowsWithPieces = row.filter((s) => s.piece);
    //     if (squareRowsWithPieces.length === 0) return;

    //     const squareRowsWithEnemyTeamPieces = squareRowsWithPieces.filter((s) => s.piece?.team === team);
    //     if (squareRowsWithEnemyTeamPieces.length === 0) return;

    //     squareRowsWithRightTeamPieces.forEach((square) => {
    //       const possibilities = calculatePossible("captures", square);
    //       possibilities.forEach((p) => {
    //         targetingSquares.push(p);
    //       });
    //     });
    //   });
    //   const teams: TeamType[] = ["bright", "dark"];
    //   const checks: boolean[] = [];
    //   teams.forEach((team) => {
    //     const myKingSquare = squares.map((row) => row.find((s) => s.piece && s.piece.name == "king" && s.piece.team == team)).filter((u) => u)[0] ?? null;
    //     if (!myKingSquare) return;
    //     checks.push(targetingSquares.includes(myKingSquare));
    //   });
    //   return checks;
    // };
    // checkIfItsInCheck(squares, square.piece.team);

    if (square.piece.name == "pawn") {
      const oneStepSquare = foward(square, squares);
      const twoStepsSquare = foward(square, squares, 2);
      const leftCapture = left(oneStepSquare, squares);
      const rightCapture = right(oneStepSquare, squares);

      // Can only walks 2 ahead in case is in the first row and there is nothing blocking it
      if ((playingTeam == "bright" ? square.row == 2 : square.row == 7) && oneStepSquare && !oneStepSquare.piece && twoStepsSquare && !twoStepsSquare.piece)
        possibilities.push(twoStepsSquare);

      // Can capture if there is an enemy piece on the diagonals
      if (leftCapture && leftCapture.piece && leftCapture.piece.team != playingTeam) possibilities.push(leftCapture);
      if (rightCapture && rightCapture.piece && rightCapture.piece.team != playingTeam) possibilities.push(rightCapture);

      // Can only walk foward if the next square is not occupied
      if (oneStepSquare && !oneStepSquare.piece) possibilities.push(oneStepSquare);
      return possibilities;
    }

    if (square.piece.name == "knight") {
      // Can walk into any direction in an L if there is not a piece of his own
      return lshape(square, squares).filter((s) => !s.piece || s.piece.team != square.piece?.team);
    }

    if (square.piece.name == "bishop") {
      // Can walk into many squares in any of the four diagonal, stops the diagonal in case there is a piece there
      diagonals(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece && square.piece.team == playingTeam) break;
          if (square.piece && square.piece.team != playingTeam) {
            possibilities.push(square);
            break;
          }
          possibilities.push(square);
        }
      });

      return possibilities;
    }

    if (square.piece.name == "rook") {
      // Can walk into many squares in any of the four straight lines, stops the line in case there is a piece there
      lines(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece && square.piece.team == playingTeam) break;
          if (square.piece && square.piece.team != playingTeam) {
            possibilities.push(square);
            break;
          }
          possibilities.push(square);
        }
      });

      return possibilities;
    }

    if (square.piece.name == "queen") {
      // Bishop + Rook
      lines(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece && square.piece.team == playingTeam) break;
          if (square.piece && square.piece.team != playingTeam) {
            possibilities.push(square);
            break;
          }
          possibilities.push(square);
        }
      });
      diagonals(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece && square.piece.team == playingTeam) break;
          if (square.piece && square.piece.team != playingTeam) {
            possibilities.push(square);
            break;
          }
          possibilities.push(square);
        }
      });
      return possibilities;
    }

    if (square.piece.name == "king") {
      // Can walk into the neighbors squares in case there is no ally piece
      neighbors(square, squares).forEach((s) => {
        if (s.piece && s.piece.team == playingTeam) return;
        // if (targetingSquares[["dark", "bright"].findIndex((t) => t == team)].includes(s)) return;
        if (s.piece && s.piece.team == oppositeTeam) {
          possibilities.push(s);
          return;
        }
        possibilities.push(s);
      });
      return possibilities;
    }

    return [];
  };

  function generateSquares(): Square[] {
    const squares: Square[] = [];

    function generatePieceOrNothing(coordinates: string): { name: PieceName; team: TeamType; jsx: ReactElement } | null {
      // if (coordinates[1] == "2" || coordinates[1] == "7")
      //   return {
      //     name: "pawn",
      //     team: coordinates[1] == "2" ? "bright" : "dark",
      //     jsx: <Piece piece="pawn" team={coordinates[1] == "2" ? "bright" : "dark"} />,
      //   };
      // if (coordinates == "a1" || coordinates == "h1" || coordinates == "a8" || coordinates == "h8")
      //   return {
      //     name: "rook",
      //     team: coordinates[1] == "1" ? "bright" : "dark",
      //     jsx: <Piece piece="rook" team={coordinates[1] == "1" ? "bright" : "dark"} />,
      //   };
      // if (coordinates == "b1" || coordinates == "g1" || coordinates == "b8" || coordinates == "g8")
      //   return {
      //     name: "knight",
      //     team: coordinates[1] == "1" ? "bright" : "dark",
      //     jsx: <Piece piece="knight" team={coordinates[1] == "1" ? "bright" : "dark"} />,
      //   };
      // if (coordinates == "c1" || coordinates == "f1" || coordinates == "c8" || coordinates == "f8")
      //   return {
      //     name: "bishop",
      //     team: coordinates[1] == "1" ? "bright" : "dark",
      //     jsx: <Piece piece="bishop" team={coordinates[1] == "1" ? "bright" : "dark"} />,
      //   };
      // if (coordinates == "d1" || coordinates == "d8")
      //   return {
      //     name: "queen",
      //     team: coordinates[1] == "1" ? "bright" : "dark",
      //     jsx: <Piece piece="queen" team={coordinates[1] == "1" ? "bright" : "dark"} />,
      //   };
      // if (coordinates == "e1" || coordinates == "e8")
      //   return {
      //     name: "king",
      //     team: coordinates[1] == "1" ? "bright" : "dark",
      //     jsx: <Piece piece="king" team={coordinates[1] == "1" ? "bright" : "dark"} />,
      //   };

      if (coordinates == "e5")
        return {
          name: "king",
          team: "bright",
          jsx: <Piece piece="king" team={"bright"} />,
        };
      if (coordinates == "d6")
        return {
          name: "rook",
          team: "dark",
          jsx: <Piece piece="rook" team={"dark"} />,
        };

      return null;
    }

    rows.forEach((row, key) => {
      columns.forEach((column, u) => {
        squares.push({
          id: column + row,
          color: (u - key) % 2 == 0 ? "bright" : "dark",
          piece: generatePieceOrNothing(column + row),
          selected: false,
          possibility: null,
          row: row,
          column: column,
        });
      });
    });

    return squares;
  }

  return { calculatePiecePossibleMoves, generateSquares };
}

// Help the helpers
function getSquareById(id: string, squares: Square[]): Square | null {
  return squares.filter((s) => s.id == id)[0] ?? null;
}

// Functions helpers for finding paths for pieces
// It returns the square in that direction
function foward(square: Square | null, squares: Square[], times: number = 1): Square | null {
  if (!square || !square.piece) return null;
  const column = square.column;
  const row = square.piece.team == "bright" ? square.row + times : square.row - times;
  return getSquareById(column + row, squares);
}

function top(square: Square | null, squares: Square[], times: number = 1): Square | null {
  if (!square) return null;
  const column = square.column;
  const row = square.row + times;
  return getSquareById(column + row, squares);
}

function bottom(square: Square | null, squares: Square[], times: number = 1): Square | null {
  if (!square) return null;
  const column = square.column;
  const row = square.row - times;
  return getSquareById(column + row, squares);
}

function right(square: Square | null, squares: Square[], times: number = 1): Square | null {
  if (!square) return null;
  const columnIndex = columns.findIndex((c) => c == square.column);
  const column = columns[columnIndex + times];
  const row = square.row;
  return getSquareById(column + row, squares);
}

function left(square: Square | null, squares: Square[], times: number = 1): Square | null {
  if (!square) return null;
  const columnIndex = columns.findIndex((c) => c == square.column);
  const column = columns[columnIndex - times];
  const row = square.row;
  return getSquareById(column + row, squares);
}

function lshape(square: Square, squares: Square[]): Square[] {
  const tl = top(left(square, squares), squares, 2);
  const tr = top(right(square, squares), squares, 2);
  const bl = bottom(left(square, squares), squares, 2);
  const br = bottom(right(square, squares), squares, 2);
  const rt = right(top(square, squares), squares, 2);
  const rb = right(bottom(square, squares), squares, 2);
  const lt = left(top(square, squares), squares, 2);
  const lb = left(bottom(square, squares), squares, 2);
  return [tl, tr, bl, br, lt, rt, lb, rb].filter((c) => c !== null);
}

function diagonals(square: Square, squares: Square[]): Square[][] {
  const possibilities: Square[][] = [];
  let current: Square | null = square;
  let stage: number | null = 0;

  while (current) {
    if (stage == 0) {
      possibilities.push([]);
      current = top(left(current, squares), squares);
      if (current) {
        possibilities[0].push(current);
        continue;
      }
      current = square;
      stage = 1;
    }
    if (stage == 1) {
      possibilities.push([]);
      current = top(right(current, squares), squares);
      if (current) {
        possibilities[1].push(current);
        continue;
      }
      current = square;
      stage = 2;
    }
    if (stage == 2) {
      possibilities.push([]);
      current = bottom(right(current, squares), squares);
      if (current) {
        possibilities[2].push(current);
        continue;
      }
      current = square;
      stage = 3;
    }
    if (stage == 3) {
      possibilities.push([]);
      current = bottom(left(current, squares), squares);
      if (current) {
        possibilities[3].push(current);
        continue;
      }
      current = square;
      stage = null;
    }
    current = null;
  }

  return possibilities.filter((c) => c !== null);
}

function lines(square: Square, squares: Square[]): Square[][] {
  const possibilities: Square[][] = [];
  let current: Square | null = square;
  let stage: number | null = 0;

  while (current) {
    if (stage == 0) {
      possibilities.push([]);
      current = top(current, squares);
      if (current) {
        possibilities[0].push(current);
        continue;
      }
      current = square;
      stage = 1;
    }
    if (stage == 1) {
      possibilities.push([]);
      current = right(current, squares);
      if (current) {
        possibilities[1].push(current);
        continue;
      }
      current = square;
      stage = 2;
    }
    if (stage == 2) {
      possibilities.push([]);
      current = bottom(current, squares);
      if (current) {
        possibilities[2].push(current);
        continue;
      }
      current = square;
      stage = 3;
    }
    if (stage == 3) {
      possibilities.push([]);
      current = left(current, squares);
      if (current) {
        possibilities[3].push(current);
        continue;
      }
      current = square;
      stage = null;
    }
    current = null;
  }

  return possibilities.filter((c) => c !== null);
}

function neighbors(square: Square, squares: Square[]): Square[] {
  const tl = top(left(square, squares), squares);
  const tc = top(square, squares);
  const tr = top(right(square, squares), squares);
  const cr = right(square, squares);
  const cl = left(square, squares);
  const bl = bottom(left(square, squares), squares);
  const bc = bottom(square, squares);
  const br = bottom(right(square, squares), squares);
  return [tl, tc, tr, cr, cl, bl, bc, br].filter((c) => c != null);
}
