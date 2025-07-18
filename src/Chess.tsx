import { useState } from "react";
import Board from "./components/Board";

import { generateSquares } from "./helpers";

export default function Chess() {
  const [squares, setSquares] = useState(generateSquares());
  console.log(squares);
  return <Board squares={squares} />;
}
