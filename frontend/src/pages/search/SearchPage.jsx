import { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate here
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFollow from "../../hooks/useFollow";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { follow, isPending } = useFollow();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate(); // ✅ used for programmatic navigation

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== "") {
        setIsSearching(true);
        fetch(`/api/user/search/${query}`)
          .then((res) => res.json())
          .then((data) => setSuggestion(data))
          .catch((err) => console.error(err))
          .finally(() => setIsSearching(false));
      } else {
        setSuggestion([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleKeyDown = (e) => {
    if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === "ArrowDown") {
      if (selectedIndex < suggestion.length - 1) {
        setSelectedIndex((prev) => prev + 1);
      }
    } else if (e.key === "ArrowUp") {
      if (selectedIndex > 0) {
        setSelectedIndex((prev) => prev - 1);
      }
    } else if (e.key === "Enter") {
      if (selectedIndex !== -1) {
        const user = suggestion[selectedIndex];
        setSelectedIndex(-1);
        setSuggestion([]);
        navigate(`/profile/${user.username}`); // ✅ Correct way to navigate
      }
    }
  };

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <p className="font-bold">Search</p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mt-4">
        <form className="w-[500px] relative" onSubmit={(e) => e.preventDefault()}>
          <input
            onKeyDown={handleKeyDown}
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-white"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-blue-500 rounded-full p-2 hover:bg-blue-600 transition"
          >
            <IoSearchSharp className="w-6 h-6 text-white" />
          </button>
        </form>
      </div>

      {/* Search Results */}
      <div className="flex flex-col items-center mt-6">
        {isSearching ? (
          <LoadingSpinner />
        ) : (
          suggestion.map((user, index) => (
            <Link
              to={`/profile/${user.username}`}
              className={`flex items-center justify-between gap-4 w-full max-w-md px-4 py-2 hover:bg-gray-800 rounded-md transition ${
                selectedIndex === index ? "outline outline-2 outline-blue-500" : ""
              }`}
              key={user._id}
            >
              <div className="flex gap-2 items-center">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src={user.profileImg || "/avatar-placeholder.png"} alt="profile" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold tracking-tight truncate w-28">
                    {user.fullName}
                  </span>
                  <span className="text-sm text-slate-500">@{user.username}</span>
                </div>
              </div>
              <button
                className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  follow(user._id);
                }}
              >
                {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
              </button>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;
