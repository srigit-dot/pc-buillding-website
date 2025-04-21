import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3001/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <div className="p-10 flex flex-col items-center gap-4">
      {categories.map((cat, index) => (
        <div
          key={index}
          onClick={() => navigate(`/products/${cat}`)}
          className="w-full max-w-md bg-gray-800 text-white text-center py-4 rounded-xl shadow-lg cursor-pointer hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-blue-500"
        >
          {cat}
        </div>
      ))}
    </div>
  );
}

export default CategoryList;
