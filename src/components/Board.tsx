/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Board({ squares, click }: { squares: any[][]; click: (square: any) => void }) {
  return (
    <div className="w-160 h-160 border grid grid-cols-8">
      {squares.map((row) =>
        row.map((square) => (
          <div
            key={square.id}
            onClick={() => {
              click(square);
            }}
            className={
              "relative flex items-center justify-center h-20 w-20 " +
              (square.color == "bright" ? "bg-white text-black " : "bg-black text-white ") +
              (square.selected ? "bg-blue-300/20 " : "")
            }
          >
            {square.selected && <div className="absolute inset-0 bg-blue-500 opacity-20 z-10"></div>}
            <div className="absolute z-20">{square.piece}</div>
          </div>
        ))
      )}
    </div>
  );
}
