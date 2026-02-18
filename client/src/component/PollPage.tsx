import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Poll from "./Poll";
import axios from "axios";
const API_URL = import.meta.env.VITE_BASE_URL;

export type PollType = {
    id: string;
    statement: string;
    options: Record<string, number>;
    validTill: string;
    createdAt: string;
};

const PollPage = () => {
    const [pollList, setPollList] = useState<PollType[]>([]);
    const [selectedPoll, setSelectedPoll] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const getLivePolls = async () => {
            try {
                const response = await axios.get(`${API_URL}/poll/get-polls`, {
                    withCredentials: true,
                });
                // console.log(response)
                setPollList(response.data);

                if (response.data.length > 0) {
                    setSelectedPoll(response.data[0].id);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to fetch polls");
            } finally {
                setLoading(false);
            }
        };
        getLivePolls();

    }, []);

    const handleSelectedPoll = (poll: PollType) => {
        setSelectedPoll(poll.id);
    };

    if (loading) return <p>Loading polls...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className=" w-full h-full flex flex-col md:flex-row justify-around border border-gray-300 p-10 overflow-x-hidden">
            {/* Left Side - Poll List */}
            <div className="min-w-100 h-auto space-y-4 overflow-auto overflow-x-hidden  ">
                <Link to="/create" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4">
                    + Create Poll
                </Link>
                {pollList.map((poll, index) => (
                    <div
                        key={poll.id}
                        onClick={() => handleSelectedPoll(poll)}
                        className=" w-full flex justify-evenly cursor-pointer border p-3 rounded hover:bg-gray-100"
                    >
                        <p>Poll {index + 1}</p>
                        <p>valid till: {new Date(poll.validTill).toLocaleDateString()}</p>
                        <p>copy link: {poll.id}</p>
                    </div>
                ))}
            </div>

            {/* Right Side - Selected Poll */}
            <div className="min-w-[400px] h-auto border-4 border-t-green-300 p-4">
                {selectedPoll ? (
                    <Poll pollId={selectedPoll} />
                ) : (
                    <p>select a poll to vote</p>
                )}
            </div>
        </div>
    );
};

export default PollPage;
