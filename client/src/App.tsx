import { BrowserRouter, Routes, Route } from "react-router-dom";
import PollPage from "./component/PollPage";
import PollForm from "./component/PollForm";
import "./index.css";

const App = () => {
    return (
        <BrowserRouter>
            <div className="flex flex-col items-center h-screen">
                <h1 className="text-3xl font-bold">Fair Poll System</h1>
                <Routes>
                    <Route path="/" element={<PollPage />} />
                    <Route path="/create" element={<PollForm />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};
export default App;