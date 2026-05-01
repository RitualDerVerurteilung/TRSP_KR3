import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import RegLogPage from "./pages/RegLogPage/RegLogPage"
import "./Basic.css";


function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/" element={<RegLogPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;
