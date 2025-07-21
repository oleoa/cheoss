import type { ReactElement } from "react";

export type PieceName = "pawn" | "rook" | "bishop" | "knight" | "queen" | "king";
export type TeamType = "bright" | "dark";
export type RowType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type ColumnType = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

export interface Piece {
  name: PieceName;
  team: TeamType;
  jsx: ReactElement | null;
  moved: boolean;
  doubledfoward: boolean;
}

export interface Square {
  id: string;
  color: TeamType;
  piece: Piece | null;
  selected: boolean;
  possibility: TeamType | null;
  row: RowType;
  column: ColumnType;
}

export interface Move {
  type: "normal" | "doublefoward" | "enpassant" | "castling" | "promoting";
  move: Square;
  special?: {
    castling?: {
      king: {
        from: Square;
        through: Square;
        to: Square;
      };
      rook: {
        from: Square;
        to: Square;
      };
    };
    enpassant?: {
      moves: {
        from: Square;
        to: Square;
      };
      captures: Square;
    };
  };
}
