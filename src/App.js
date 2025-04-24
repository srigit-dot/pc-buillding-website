import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CategoryList from "./CategoryList";
import ProductList from "./ProductList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CategoryList />} />
        <Route path="/products/:category" element={<ProductList />} />
      </Routes>
    </Router>
  );
}

export default App;
