import type { RowType, ColumnType, Square, PieceName, TeamType } from "../interfaces";
import type { ReactElement } from "react";
import { Piece } from "../components/Piece";

export default function usePieces() {
  // The most complex function on the project
  // It should calculate, for each piece, what squares it can move in to
  // It should take in consideration wheter or not it would put the king in check
  // That is, moving to a square under attack, undescovered check or not leaving from a check
  const calculatePiecePossibleMoves = (square: Square, squares: Square[][]): Square[] => {
    if (!square || !square.piece) return [];

    const foward = (square: Square, rows: number = 1): number => {
      if (!square.piece) return -1;
      return square.piece.team == "bright" ? square.rowIndex - rows : square.rowIndex + rows;
    };

    const top = (square: Square, rows: number = 1): number => {
      if (!square.piece) return -1;
      return square.rowIndex - rows;
    };

    const bottom = (square: Square, rows: number = 1): number => {
      if (!square.piece) return -1;
      return square.rowIndex + rows;
    };

    const right = (square: Square, columns: number = 1): number => {
      if (!square.piece) return -1;
      return square.columnIndex + columns;
    };

    const left = (square: Square, columns: number = 1): number => {
      if (!square.piece) return -1;
      return square.columnIndex - columns;
    };

    const lshape = (square: Square): Square[] => {
      const tl = squares[top(square, 2)]?.[right(square)] ?? null;
      const tr = squares[top(square, 2)]?.[left(square)] ?? null;
      const bl = squares[bottom(square, 2)]?.[right(square)] ?? null;
      const br = squares[bottom(square, 2)]?.[left(square)] ?? null;
      const rt = squares[top(square)]?.[square.columnIndex - 2] ?? null;
      const rb = squares[bottom(square)]?.[square.columnIndex - 2] ?? null;
      const lt = squares[top(square)]?.[square.columnIndex + 2] ?? null;
      const lb = squares[bottom(square)]?.[square.columnIndex + 2] ?? null;
      return [tl, tr, bl, br, lt, rt, lb, rb].filter((c) => c);
    };

    const diagonals = (square: Square): Square[][] => {
      const dtr: Square[] = [];
      const dtl: Square[] = [];
      const dbr: Square[] = [];
      const dbl: Square[] = [];

      let counter = 1;
      for (let i = square.rowIndex - 1; i >= 0; i--) {
        if (!squares[top(square, counter)][right(square, counter)]) break;
        dtr.push(squares[top(square, counter)][right(square, counter)]);
        counter++;
      }
      counter = 1;

      for (let i = square.rowIndex - 1; i >= 0; i--) {
        if (!squares[top(square, counter)][left(square, counter)]) break;
        dtl.push(squares[top(square, counter)][left(square, counter)]);
        counter++;
      }
      counter = 1;

      for (let i = square.rowIndex + 1; i <= 7; i++) {
        if (!squares[bottom(square, counter)][right(square, counter)]) break;
        dbr.push(squares[bottom(square, counter)][right(square, counter)]);
        counter++;
      }
      counter = 1;

      for (let i = square.rowIndex + 1; i <= 7; i++) {
        if (!squares[bottom(square, counter)][left(square, counter)]) break;
        dbl.push(squares[bottom(square, counter)][left(square, counter)]);
        counter++;
      }
      counter = 1;

      return [dtr, dtl, dbr, dbl].filter((c) => c);
    };

    const lines = (square: Square): Square[][] => {
      const t: Square[] = [];
      const b: Square[] = [];
      const r: Square[] = [];
      const l: Square[] = [];

      let counter = 1;
      for (let i = square.rowIndex - 1; i >= 0; i--) {
        if (!squares[top(square, counter)][square.columnIndex]) break;
        t.push(squares[top(square, counter)][square.columnIndex]);
        counter++;
      }
      counter = 1;

      for (let i = square.rowIndex + 1; i <= 7; i++) {
        if (!squares[bottom(square, counter)][square.columnIndex]) break;
        b.push(squares[bottom(square, counter)][square.columnIndex]);
        counter++;
      }
      counter = 1;

      for (let i = square.columnIndex + 1; i <= 7; i++) {
        if (!squares[square.rowIndex][right(square, counter)]) break;
        r.push(squares[square.rowIndex][right(square, counter)]);
        counter++;
      }
      counter = 1;

      for (let i = square.columnIndex - 1; i >= 0; i--) {
        if (!squares[square.rowIndex][left(square, counter)]) break;
        l.push(squares[square.rowIndex][left(square, counter)]);
        counter++;
      }
      counter = 1;

      return [t, b, r, l].filter((c) => c);
    };

    const neighbors = (square: Square): Square[] => {
      const tl = squares[top(square)]?.[left(square)] ?? null;
      const tc = squares[top(square)]?.[square.columnIndex] ?? null;
      const tr = squares[top(square)]?.[right(square)] ?? null;
      const cr = squares[square.rowIndex]?.[right(square)] ?? null;
      const cl = squares[square.rowIndex]?.[left(square)] ?? null;
      const bl = squares[bottom(square)]?.[left(square)] ?? null;
      const bc = squares[bottom(square)]?.[square.columnIndex] ?? null;
      const br = squares[bottom(square)]?.[right(square)] ?? null;
      return [tl, tc, tr, cr, cl, bl, bc, br].filter((c) => c);
    };

    if (square.piece.name == "pawn") {
      const possibilities: Square[] = [];
      // Can only walks 2 ahead in case is in the first row and there is nothing blocking it
      if (
        (square.piece.team == "bright" ? square.row == 2 : square.row == 7) &&
        !squares[foward(square)][square.columnIndex].piece &&
        !squares[foward(square, 2)][square.columnIndex].piece
      )
        possibilities.push(squares[foward(square, 2)][square.columnIndex]);

      // Can capture if there is an enemy piece on the diagonals
      const diagonalLeftPiece = squares[foward(square)][square.columnIndex - 1] ? squares[foward(square)][square.columnIndex - 1].piece : null;
      if (diagonalLeftPiece && diagonalLeftPiece.team != square.piece.team) possibilities.push(squares[foward(square)][square.columnIndex - 1]);
      const diagonalRightPiece = squares[foward(square)][square.columnIndex + 1] ? squares[foward(square)][square.columnIndex + 1].piece : null;
      if (diagonalRightPiece && diagonalRightPiece.team != square.piece.team) possibilities.push(squares[foward(square)][square.columnIndex + 1]);

      // Can only walk foward if the next square is not occupied
      if (!squares[foward(square)][square.columnIndex].piece) possibilities.push(squares[foward(square)][square.columnIndex]);
      return possibilities;
    }

    if (square.piece.name == "knight") {
      // Can walk into any direction in an L if there is not a piece of his own
      return lshape(square).filter((s) => !s.piece || s.piece.team != square.piece?.team);
    }

    if (square.piece.name == "bishop") {
      const possibilities: Square[] = [];
      // Can walk into many squares in any of the four diagonal, stops the diagonal in case there is a piece there
      diagonals(square).forEach((ps) => {
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          if (p.piece && p.piece.team == square.piece?.team) break;
          if (p.piece && p.piece.team != square.piece?.team) {
            possibilities.push(p);
            break;
          }
          possibilities.push(p);
        }
      });
      return possibilities;
    }

    if (square.piece.name == "rook") {
      // Can walk into many squares in any of the four straight lines, stops the line in case there is a piece there
      const possibilities: Square[] = [];
      lines(square).forEach((ps) => {
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          if (p.piece && p.piece.team == square.piece?.team) break;
          if (p.piece && p.piece.team != square.piece?.team) {
            possibilities.push(p);
            break;
          }
          possibilities.push(p);
        }
      });
      return possibilities;
    }

    if (square.piece.name == "queen") {
      // Bishop + Rook
      const possibilities: Square[] = [];
      lines(square).forEach((ps) => {
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          if (p.piece && p.piece.team == square.piece?.team) break;
          if (p.piece && p.piece.team != square.piece?.team) {
            possibilities.push(p);
            break;
          }
          possibilities.push(p);
        }
      });
      diagonals(square).forEach((ps) => {
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          if (p.piece && p.piece.team == square.piece?.team) break;
          if (p.piece && p.piece.team != square.piece?.team) {
            possibilities.push(p);
            break;
          }
          possibilities.push(p);
        }
      });
      return possibilities;
    }

    if (square.piece.name == "king") {
      // Can walk into the neighbors squares in case there is no ally piece
      const possibilities: Square[] = [];
      neighbors(square).forEach((s) => {
        const team = square.piece?.team;
        if (!team) return;
        if (s.piece && s.piece.team == square.piece?.team) return;
        // if (targetingSquares[["dark", "bright"].findIndex((t) => t == team)].includes(s)) return;
        if (s.piece && s.piece.team != square.piece?.team) {
          possibilities.push(s);
          return;
        }
        possibilities.push(s);
      });
      return possibilities;
    }

    return [];
  };

  function generateSquares() {
    const rows: RowType[] = [8, 7, 6, 5, 4, 3, 2, 1];
    const columns: ColumnType[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const squares: Square[][] = [];

    function generatePieceOrNothing(coordinates: string): { name: PieceName; team: TeamType; jsx: ReactElement } | null {
      if (coordinates[1] == "2" || coordinates[1] == "7")
        return {
          name: "pawn",
          team: coordinates[1] == "2" ? "bright" : "dark",
          jsx: <Piece piece="pawn" team={coordinates[1] == "2" ? "bright" : "dark"} />,
        };
      if (coordinates == "a1" || coordinates == "h1" || coordinates == "a8" || coordinates == "h8")
        return {
          name: "rook",
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="rook" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };
      if (coordinates == "b1" || coordinates == "g1" || coordinates == "b8" || coordinates == "g8")
        return {
          name: "knight",
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="knight" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };
      if (coordinates == "c1" || coordinates == "f1" || coordinates == "c8" || coordinates == "f8")
        return {
          name: "bishop",
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="bishop" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };
      if (coordinates == "d1" || coordinates == "d8")
        return {
          name: "queen",
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="queen" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };
      if (coordinates == "e1" || coordinates == "e8")
        return {
          name: "king",
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="king" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };

      // if (coordinates == "d4")
      //   return {
      //     name: "king",
      //     team: "bright",
      //     jsx: <Piece piece="king" team={"bright"} />,
      //   };
      // if (coordinates == "e4")
      //   return {
      //     name: "pawn",
      //     team: "bright",
      //     jsx: <Piece piece="pawn" team={"bright"} />,
      //   };
      // if (coordinates == "f4")
      //   return {
      //     name: "rook",
      //     team: "dark",
      //     jsx: <Piece piece="rook" team={"dark"} />,
      //   };

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
          possibility: null,
          treat: false,
          row: row,
          column: column,
          rowIndex: key,
          columnIndex: u,
        });
      });
    });
    return squares;
  }

  return { calculatePiecePossibleMoves, generateSquares };
}
