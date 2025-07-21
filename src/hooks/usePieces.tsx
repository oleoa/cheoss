import type { RowType, ColumnType, Square, Move, Piece as PieceType, TeamType } from "../interfaces";
import { Piece } from "../components/Piece";

const rows: RowType[] = [8, 7, 6, 5, 4, 3, 2, 1];
const columns: ColumnType[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function usePieces() {
  // The most complex function on the project
  // It should calculate, for each piece, what squares it can move in to
  // It should take in consideration wheter or not it would put the king in check
  // That is, moving to a square under attack, undescovered check or not leaving from a check
  const calculatePiecePossibleMoves = (square: Square, squares: Square[]): Move[] => {
    if (!square || !square.piece) return [];

    const possibilities: Move[] = [];
    const playingTeam = square.piece.team;
    const oppositeTeam = ["bright", "dark"].filter((t) => t != playingTeam)[0];

    // It creates an snapshot of a possible game chess move and analyses if that position would let the playingking on check
    const wouldIBeInCheck = (possibleMove: Square): boolean => {
      const snapshot: Square[] = squares.map((originalSquare) => {
        if (originalSquare.id == square.id) return { ...originalSquare, piece: null };
        if (originalSquare.id != possibleMove.id) return originalSquare;
        return { ...possibleMove, piece: square.piece };
      });
      const oppositeTeamPieces: Square[] = snapshot.filter((s) => s.piece && s.piece.team == oppositeTeam);
      const myKing: Square = snapshot.filter((s) => s.piece && s.piece.team == playingTeam && s.piece.name == "king")[0];
      const targetingSquares: Square[] = [];
      oppositeTeamPieces.forEach((p) => {
        calculatePiecePossibleAttacksAndDefenses(p, snapshot).forEach((t) => targetingSquares.push(t));
      });
      return targetingSquares.map((p) => p.id).includes(myKing.id);
    };

    if (square.piece.name == "pawn") {
      const oneStepSquare = foward(square, squares);
      const twoStepsSquare = foward(square, squares, 2);
      const leftCapture = left(oneStepSquare, squares);
      const rightCapture = right(oneStepSquare, squares);

      // Can only walks 2 ahead in case is in the first row and there is nothing blocking it
      if ((playingTeam == "bright" ? square.row == 2 : square.row == 7) && oneStepSquare && !oneStepSquare.piece && twoStepsSquare && !twoStepsSquare.piece) {
        if (!wouldIBeInCheck(twoStepsSquare)) possibilities.push({ type: "doublefoward", move: twoStepsSquare });
      }

      // Can capture if there is an enemy piece on the diagonals
      if (leftCapture && leftCapture.piece && leftCapture.piece.team == oppositeTeam) {
        if (isLastRow(leftCapture, playingTeam)) possibilities.push({ type: "promoting", move: leftCapture });
        else if (!wouldIBeInCheck(leftCapture)) possibilities.push({ type: "normal", move: leftCapture });
      }
      if (rightCapture && rightCapture.piece && rightCapture.piece.team == oppositeTeam)
        if (!wouldIBeInCheck(rightCapture)) possibilities.push({ type: "normal", move: rightCapture });

      // Can only walk foward if the next square is not occupied
      if (oneStepSquare && !oneStepSquare.piece) if (!wouldIBeInCheck(oneStepSquare)) possibilities.push({ type: "normal", move: oneStepSquare });

      // En Passant
      enpassant(square, squares).forEach((move) => {
        possibilities.push(move);
      });

      return possibilities;
    }

    if (square.piece.name == "knight") {
      // Can walk into any direction in an L if there is not a piece of his own
      lshape(square, squares).forEach((position) => {
        if (position.piece && position.piece.team == playingTeam) return;
        if (!wouldIBeInCheck(position)) possibilities.push({ type: "normal", move: position });
      });
      return possibilities;
    }

    if (square.piece.name == "bishop") {
      // Can walk into many squares in any of the four diagonal, stops the diagonal in case there is a piece there
      diagonals(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece && square.piece.team == playingTeam) break;
          if (square.piece && square.piece.team == oppositeTeam) {
            if (!wouldIBeInCheck(square)) possibilities.push({ type: "normal", move: square });
            break;
          }
          if (!wouldIBeInCheck(square)) possibilities.push({ type: "normal", move: square });
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
          if (square.piece && square.piece.team == oppositeTeam) {
            if (!wouldIBeInCheck(square)) possibilities.push({ type: "normal", move: square });
            break;
          }
          if (!wouldIBeInCheck(square)) possibilities.push({ type: "normal", move: square });
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
          if (square.piece && square.piece.team == oppositeTeam) {
            if (!wouldIBeInCheck(square)) possibilities.push({ type: "normal", move: square });
            break;
          }
          if (!wouldIBeInCheck(square)) possibilities.push({ type: "normal", move: square });
        }
      });
      diagonals(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece && square.piece.team == playingTeam) break;
          if (square.piece && square.piece.team == oppositeTeam) {
            if (!wouldIBeInCheck(square)) possibilities.push({ type: "normal", move: square });
            break;
          }
          if (!wouldIBeInCheck(square)) possibilities.push({ type: "normal", move: square });
        }
      });
      return possibilities;
    }

    if (square.piece.name == "king") {
      // Can walk into the neighbors squares in case there is no ally piece
      neighbors(square, squares).forEach((possibleMove) => {
        if (possibleMove.piece && possibleMove.piece.team == playingTeam) return;
        if (wouldIBeInCheck(possibleMove)) return;
        if (possibleMove.piece && possibleMove.piece.team == oppositeTeam) {
          possibilities.push({ type: "normal", move: possibleMove });
          return;
        }
        possibilities.push({ type: "normal", move: possibleMove });
      });

      // Can castle
      castling(square, squares).forEach((p) => {
        if (!p.special || !p.special.castling) return;
        if (!wouldIBeInCheck(p.special.castling.king.through) && !wouldIBeInCheck(p.special.castling.king.to)) possibilities.push(p);
      });
      return possibilities;
    }

    return [];
  };

  const calculatePiecePossibleAttacksAndDefenses = (square: Square, squares: Square[]): Square[] => {
    if (!square || !square.piece) return [];
    const possibilities: Square[] = [];

    if (square.piece.name == "pawn") {
      const leftCapture = left(foward(square, squares), squares);
      const rightCapture = right(foward(square, squares), squares);
      if (leftCapture) possibilities.push(leftCapture);
      if (rightCapture) possibilities.push(rightCapture);
      return possibilities;
    }

    if (square.piece.name == "knight") {
      return lshape(square, squares);
    }

    if (square.piece.name == "bishop") {
      diagonals(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece) {
            possibilities.push(square);
            break;
          }
          possibilities.push(square);
        }
      });

      return possibilities;
    }

    if (square.piece.name == "rook") {
      lines(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece) {
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
          if (square.piece) {
            possibilities.push(square);
            break;
          }
          possibilities.push(square);
        }
      });
      diagonals(square, squares).forEach((direction) => {
        for (let i = 0; i < direction.length; i++) {
          const square = direction[i];
          if (square.piece) {
            possibilities.push(square);
            break;
          }
          possibilities.push(square);
        }
      });
      return possibilities;
    }

    if (square.piece.name == "king") {
      neighbors(square, squares).forEach((possibleMove) => {
        possibilities.push(possibleMove);
      });
      return possibilities;
    }

    return [];
  };

  function generateSquares(): Square[] {
    const squares: Square[] = [];

    function generatePieceOrNothing(coordinates: string): PieceType | null {
      if (coordinates[1] == "2" || coordinates[1] == "7")
        return {
          name: "pawn",
          doubledfoward: false,
          moved: false,
          team: coordinates[1] == "2" ? "bright" : "dark",
          jsx: <Piece piece="pawn" team={coordinates[1] == "2" ? "bright" : "dark"} />,
        };
      if (coordinates == "a1" || coordinates == "h1" || coordinates == "a8" || coordinates == "h8")
        return {
          name: "rook",
          doubledfoward: false,
          moved: false,
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="rook" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };
      if (coordinates == "b1" || coordinates == "g1" || coordinates == "b8" || coordinates == "g8")
        return {
          name: "knight",
          doubledfoward: false,
          moved: false,
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="knight" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };
      if (coordinates == "c1" || coordinates == "f1" || coordinates == "c8" || coordinates == "f8")
        return {
          name: "bishop",
          doubledfoward: false,
          moved: false,
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="bishop" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };
      if (coordinates == "d1" || coordinates == "d8")
        return {
          name: "queen",
          doubledfoward: false,
          moved: false,
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="queen" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };
      if (coordinates == "e1" || coordinates == "e8")
        return {
          name: "king",
          doubledfoward: false,
          moved: false,
          team: coordinates[1] == "1" ? "bright" : "dark",
          jsx: <Piece piece="king" team={coordinates[1] == "1" ? "bright" : "dark"} />,
        };

      // if (coordinates == "a8")
      //   return {
      //     name: "bishop",
      //     doubledfoward: false,
      //     moved: false,
      //     team: "dark",
      //     jsx: <Piece piece="bishop" team={"dark"} />,
      //   };
      // if (coordinates == "b7")
      //   return {
      //     name: "pawn",
      //     doubledfoward: false,
      //     moved: false,
      //     team: "bright",
      //     jsx: <Piece piece="pawn" team={"bright"} />,
      //   };

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

// Functions helpers for finding paths for pieces
// It returns the square in that direction
function getSquareById(id: string, squares: Square[]): Square | null {
  return squares.filter((s) => s.id == id)[0] ?? null;
}

function isLastRow(square: Square, team: TeamType): boolean {
  return team == "bright" ? square.row == 8 : square.row == 1;
}

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

function castling(square: Square, squares: Square[]): Move[] {
  const possibilities: Move[] = [];

  const myKing = square;
  if (!myKing.piece || myKing.piece.name != "king" || myKing.piece.moved == true) return [];

  const myRightRook = right(square, squares, 3);
  const landingRightKingPosition = right(myKing, squares, 2);
  const landingRightRookPosition = right(myKing, squares);
  const rightSquarePassingThrough = right(square, squares);
  if (
    myRightRook &&
    myRightRook.piece &&
    myRightRook.piece.name == "rook" &&
    myRightRook.piece.moved == false &&
    rightSquarePassingThrough &&
    landingRightKingPosition &&
    !landingRightKingPosition.piece &&
    landingRightRookPosition &&
    !landingRightRookPosition.piece
  )
    possibilities.push({
      type: "castling",
      move: landingRightKingPosition,
      special: {
        castling: {
          king: { from: myKing, through: rightSquarePassingThrough, to: landingRightKingPosition },
          rook: { from: myRightRook, to: landingRightRookPosition },
        },
      },
    });

  const myLeftRook = left(square, squares, 4);
  const landingLeftKingPosition = left(myKing, squares, 2);
  const leftSquarePassingThrough = left(square, squares);
  const landingLeftRookPosition = left(myKing, squares);
  if (
    myLeftRook &&
    myLeftRook.piece &&
    myLeftRook.piece.name == "rook" &&
    myLeftRook.piece.moved == false &&
    leftSquarePassingThrough &&
    landingLeftKingPosition &&
    !landingLeftKingPosition.piece &&
    landingLeftRookPosition &&
    !landingLeftRookPosition.piece
  )
    possibilities.push({
      type: "castling",
      move: landingLeftKingPosition,
      special: {
        castling: {
          king: { from: myKing, through: leftSquarePassingThrough, to: landingLeftKingPosition },
          rook: { from: myLeftRook, to: landingLeftRookPosition },
        },
      },
    });

  return possibilities;
}

function enpassant(square: Square, squares: Square[]): Move[] {
  const possibilities: Move[] = [];

  const myPawn = square;
  if (!myPawn.piece || myPawn.piece.name != "pawn") return [];

  const rightEnPassantPawn = right(myPawn, squares);
  const movesToFowardRight = right(foward(myPawn, squares), squares);
  if (
    rightEnPassantPawn &&
    rightEnPassantPawn.piece &&
    rightEnPassantPawn.piece.name == "pawn" &&
    rightEnPassantPawn.piece.doubledfoward &&
    movesToFowardRight
  ) {
    possibilities.push({
      type: "enpassant",
      move: movesToFowardRight,
      special: {
        enpassant: {
          moves: {
            from: myPawn,
            to: movesToFowardRight,
          },
          captures: rightEnPassantPawn,
        },
      },
    });
  }

  const leftEnPassantPawn = left(myPawn, squares);
  const movesToFowardLeft = left(foward(myPawn, squares), squares);
  if (leftEnPassantPawn && leftEnPassantPawn.piece && leftEnPassantPawn.piece.name == "pawn" && leftEnPassantPawn.piece.doubledfoward && movesToFowardLeft) {
    possibilities.push({
      type: "enpassant",
      move: movesToFowardLeft,
      special: {
        enpassant: {
          moves: {
            from: myPawn,
            to: movesToFowardLeft,
          },
          captures: leftEnPassantPawn,
        },
      },
    });
  }

  return possibilities;
}
