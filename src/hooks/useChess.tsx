import { useState } from "react";
import React from "react";
import type { TeamType, Square, Move, Piece as PieceType } from "../interfaces";
import usePieces from "./usePieces";
import { Piece } from "../components/Piece";

export default function useChess() {
  const { generateSquares, calculatePiecePossibleMoves } = usePieces();

  const [squares, setSquares] = useState<Square[]>(generateSquares);
  const updateSquare = (currentSquare: Square, newSquare: Square) => {
    setSquares((oldSquares) =>
      oldSquares.map((square) => {
        if (square.id != currentSquare.id) return square;
        return newSquare;
      })
    );
  };

  const [doubledFoward, setDoubledFoward] = useState<Square | null>(null);
  const cleardoubledfoward = () => {
    if (!doubledFoward || !doubledFoward.piece) return;
    const newPiece = { ...doubledFoward.piece, doubledfoward: false };
    updateSquare(doubledFoward, { ...doubledFoward, piece: newPiece });
    setDoubledFoward(null);
  };

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const clearSelection = () => {
    if (!selectedSquare) return;
    updateSquare(selectedSquare, { ...selectedSquare, selected: false });
    setSelectedSquare(null);
  };

  const [possiblesSquares, setPossibleSquares] = useState<Move[]>([]);
  const setPossibility = (square: Move) => {
    setPossibleSquares((prevPossibilities) => [square, ...prevPossibilities]);
    updateSquare(square.move, { ...square.move, possibility: playingTeam });
  };
  const setPossibilities = (possibilities: Move[]) => {
    possibilities.forEach((p) => setPossibility(p));
  };
  const clearPossibilities = () => {
    possiblesSquares.forEach((possibleSquare: Move) => {
      updateSquare(possibleSquare.move, { ...possibleSquare.move, possibility: null });
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
    const move = possiblesSquares.find((c) => c.move.id == movingSquare.id);
    if (!move) return;

    console.log(move);

    // Check to see if it's an special move
    if (move.type == "castling" || move.type == "enpassant") {
      if (!move.special) return;
      if (move.type == "castling") {
        if (!move.special.castling) return;

        // Removes both the king and the rook from their positions
        updateSquare(move.special.castling.king.from, { ...move.special.castling.king.from, selected: false, piece: null });
        updateSquare(move.special.castling.rook.from, { ...move.special.castling.rook.from, selected: false, piece: null });

        // Clears out the possibilities
        clearPossibilities();

        // Move the piece to the new square
        updateSquare(move.special.castling.king.to, { ...move.special.castling.king.to, piece: move.special.castling.king.from.piece });
        updateSquare(move.special.castling.rook.to, { ...move.special.castling.rook.to, piece: move.special.castling.rook.from.piece });
      }
      if (move.type == "enpassant") {
        if (!move.special.enpassant) return;

        // If enpassant, clears the old move before doing the changes
        cleardoubledfoward();

        // Removes the enpassant pawn
        updateSquare(move.special.enpassant.captures, { ...move.special.enpassant.captures, piece: null });
        updateSquare(move.special.enpassant.moves.from, { ...move.special.enpassant.moves.from, piece: null });

        // Clears out the possibilities
        clearPossibilities();

        // Move the piece to the new square
        updateSquare(move.special.enpassant.moves.to, { ...move.special.enpassant.moves.to, piece: move.special.enpassant.moves.from.piece });
      }
    } else if (move.type == "promoting") {
      // Removes the piece from the old square and unselect it
      updateSquare(selectedSquare, { ...selectedSquare, selected: false, piece: null });

      // Clears out the possibilities
      clearPossibilities();

      // Updates the piece
      const piece: PieceType = {
        ...selectedSquare.piece,
        moved: true,
        name: "queen",
        jsx: selectedSquare.piece.jsx ? React.createElement(Piece, { team: selectedSquare.piece.team, piece: "queen" }) : null,
      };

      // Move the piece to the new square
      updateSquare(movingSquare, { ...movingSquare, piece: piece, possibility: null });
    } else if (move.type == "doublefoward") {
      // Removes the piece from the old square and unselect it
      updateSquare(selectedSquare, { ...selectedSquare, selected: false, piece: null });

      // Clears out the possibilities
      clearPossibilities();

      // Updates the piece
      const piece: PieceType = { ...selectedSquare.piece, moved: true, doubledfoward: true };

      const newSquare: Square = { ...movingSquare, piece: piece, possibility: null };

      // Alerts the game that that pawn doubled foward
      setDoubledFoward(newSquare);

      // Move the piece to the new square
      updateSquare(movingSquare, newSquare);
    } else {
      // Removes the piece from the old square and unselect it
      updateSquare(selectedSquare, { ...selectedSquare, selected: false, piece: null });

      // Clears out the possibilities
      clearPossibilities();

      // Updates the piece
      const piece = { ...selectedSquare.piece, moved: true };

      // Move the piece to the new square
      updateSquare(movingSquare, { ...movingSquare, piece: piece, possibility: null });
    }

    // Unselect the square
    setSelectedSquare(null);

    if (move.type != "enpassant") cleardoubledfoward();

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
    if (!possiblesSquares.map((p) => p.move.id).includes(square.id)) {
      clearSelection();
      clearPossibilities();
      return;
    }

    return newMove(square);
  };

  return { squares, click };
}
