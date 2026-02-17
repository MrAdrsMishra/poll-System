import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

const PollForm = () => {
    const [statement, setStatement] = useState<string>("");
    const [options, setOptions] = useState<string[]>(["", "", "", ""]);
    const [validTill, setValidTill] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validOptions = options
            .map(opt => opt.trim())
            .filter(opt => opt !== "");
        if (!statement.trim()) {
            setMessage("Statement is required (min 10 characters)");
            return;
        }
        if (statement.trim().length < 10) {
            setMessage("Statement must be at least 10 characters");
            return;
        }
        if (validOptions.length < 2) {
            setMessage("Please add at least 2 options");
            return;
        }
        if (!validTill) {
            setMessage("Please set a valid till date");
            return;
        }
        setMessage("");
        try {
            const response = await axios.post(`${API_URL}/poll/create-poll`, {
                statement: statement.trim(),
                options: validOptions,
                validTill: new Date(validTill),
            });
            console.log(response.data);
            setMessage("Poll created successfully");
            setStatement("");
            setOptions(["", "", "", ""]);
            setValidTill("");
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.message || "Something went wrong";
            setMessage(errMsg);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="min-h-[400px] min-w-[400px] flex flex-col gap-2 border border-gray-300">
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border border-gray-300 rounded">
                    <Link to="/" className="text-blue-500 hover:text-blue-700 mb-2">← Back to Polls</Link>
                    <h1 className="text-2xl font-bold text-center">Create Poll</h1>

                    {message && <p className={message === "Poll created successfully" ? "text-green-500" : "text-red-500"}>{message}</p>}
                    <textarea name="statement"
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                        className="border border-gray-300 rounded p-2"
                        placeholder="Enter your poll statement (min 10 characters)"
                    ></textarea>

                    {options.map((option, index) => (
                        <input
                            key={index}
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                            }
                            className="border border-gray-300 rounded p-2"
                        />
                    ))}

                    <label className="text-sm text-gray-600">Valid Till</label>
                    <input
                        type="datetime-local"
                        value={validTill}
                        onChange={(e) => setValidTill(e.target.value)}
                        className="border border-gray-300 rounded p-2"
                    />

                    <button type="submit" className="bg-blue-500 text-white p-2 rounded">Create Poll</button>
                </form>

            </div>
        </div>
    );
};

export default PollForm;
