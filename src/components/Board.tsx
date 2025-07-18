/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Board({ squares }: { squares: any[][] }) {
  return (
    <div className="w-160 h-160 border grid grid-cols-8">
      {squares.map((row) =>
        row.map((square) => (
          <div
            key={square.id}
            className={
              "flex items-center justify-center h-20 w-20 " +
              (square.color == "bright" ? "bg-white text-black " : "bg-black text-white ")
            }
          >
            {square.piece}
          </div>
        ))
      )}
    </div>
  );
}
