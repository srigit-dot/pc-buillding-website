function FlipCard({ product }) {
  return (
    <div className="group w-full h-64 [perspective:1000px]">
      <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        
        {/* Front Side */}
        <div className="absolute w-full h-full bg-white border rounded-xl shadow-md p-4 [backface-visibility:hidden]">
          <h2 className="text-lg font-bold mb-2">{product.name}</h2>
          <p className="text-gray-700 font-semibold">${product.price}</p>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full bg-blue-100 border rounded-xl shadow-md p-4 [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-auto">
          <ul className="text-sm space-y-1">
            {Object.entries(product).map(([key, value], index) =>
              key !== "name" && key !== "price" ? (
                <li key={index}>
                  <strong>{key}:</strong> {value}
                </li>
              ) : null
            )}
          </ul>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
