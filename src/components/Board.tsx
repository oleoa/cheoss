import { type Square } from "../interfaces";

export default function Board({ squares, click }: { squares: Square[]; click: (square: Square) => void }) {
  return (
    <div className="border-4">
      <div className="w-160 h-160 grid grid-cols-8 grid-rows-8">
        {squares.map((square) => (
          <div
            key={square.id}
            onClick={() => {
              click(square);
            }}
            className={"relative flex items-center justify-center h-20 w-20 " + (square.color == "bright" ? "bg-white text-black " : "bg-black text-white ")}
          >
            {square.selected && (
              <div className={"absolute inset-0 opacity-20 rounded-full m-1 z-10 " + (square.piece?.team == "bright" ? "bg-blue-500" : "bg-green-500")}></div>
            )}
            {square.possibility && (
              <div className={"absolute inset-0 opacity-20 rounded-full m-5 z-10 " + (square.possibility == "bright" ? "bg-blue-500" : "bg-green-500")}></div>
            )}
            <div className="absolute inset-0 z-20 w-full h-full flex items-center justify-center">{square.piece && square.piece.jsx}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
