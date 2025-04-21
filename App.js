import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CategoryList from "./components/CategoryList";
import ProductList from "./components/ProductList";

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
