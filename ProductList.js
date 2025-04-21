import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FlipCard from "./FlipCard";

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/products/${category}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, [category]);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <FlipCard key={index} product={product} />
      ))}
    </div>
  );
}

export default ProductList;
