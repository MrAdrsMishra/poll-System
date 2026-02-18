import { useEffect, useState } from "react";
import type { PollType } from "./PollPage";
import axios from "axios";
const API_URL = import.meta.env.VITE_BASE_URL;

const Poll = ({ pollId }: { pollId: string }) => {
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [pollData, setPollData] = useState<PollType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [fingerprint] = useState(() => crypto.randomUUID());

    useEffect(() => {
        const loadPoll = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/poll/${pollId}`);
                setPollData(response.data);
            } catch (error) {
                console.error("Error loading poll:", error);
                setMessage("Error loading poll data");
            } finally {
                setLoading(false);
            }
        };

        loadPoll();
        setHasVoted(false);
        setMessage("");
        const voted = localStorage.getItem(pollId);
        if (voted === "true") {
            setHasVoted(true);
            setMessage("You have already voted");
        }

        // SSE for live updates
        const eventSource = new EventSource(`${API_URL}/poll/${pollId}/live`);
        eventSource.onmessage = (event) => {
            const updatedPoll = JSON.parse(event.data);
            setPollData(updatedPoll);
        };
        return () => eventSource.close();
    }, [pollId]);

    const handleVoting = async (option: string) => {
        if (hasVoted) {
            setMessage("You have already voted");
            return;
        }
        try {
            const response = await axios.post(
                `${API_URL}/poll/${pollId}/vote`,
                { option, fingerprint },
                { withCredentials: true }
            );
            setPollData(response.data);
            localStorage.setItem(pollId, "true");
            setHasVoted(true);
            setMessage("You have voted successfully");
            setTimeout(() => setMessage(""), 3000);
        } catch (err: any) {
            const errMsg = err.response?.data?.message || "Failed to vote";
            setMessage(errMsg);
        }
    };

    if (loading) return <p>Loading poll...</p>;
    if (!pollData) return <p>Poll not found</p>;

    const totalVotes = Object.values(pollData.options).reduce((a, b) => a + b, 0);

    return (
        <div>
            {message && <p className={message === "You have already voted" ? "text-green-500" : "text-red-500"}>{message}</p>}
            <div className="font-semibold mb-4">
                <p>Poll ID: {pollId}</p>
                <p>{pollData.statement}</p>
            </div>
            <div className="space-y-3">
                {Object.entries(pollData.options).map(([option, votes]) => {
                    const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                    return (
                        <div
                            key={option}
                            onClick={() => handleVoting(option)}
                            className={`border p-2 rounded cursor-pointer 
                                ${hasVoted ? "bg-gray-200 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50"}
                            `}
                        >
                            <div className="flex justify-between">
                                <span>{option}</span>
                                <span>{votes} votes ({percentage}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-sm text-gray-500 mt-2">Total votes: {totalVotes}</p>
        </div>
    );
};

export default Poll;
