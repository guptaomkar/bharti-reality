import React from "react";
import { HiLocationMarker } from "react-icons/hi";
import "./SearchBar.css";

const SearchBar = ({ filter, setFilter, onSearch }) => {
  const handleKey = (e) => {
    if (e.key === "Enter" && onSearch) onSearch();
  };

  return (
    <div className="haven-search-bar">
      <HiLocationMarker color="var(--gold)" size={18} />
      <input
        className="haven-search-input"
        placeholder="Search by title / city / country…"
        type="text"
        value={filter || ""}
        onChange={(e) => setFilter && setFilter(e.target.value)}
        onKeyDown={handleKey}
      />
      <button className="haven-search-btn" onClick={onSearch}>Search</button>
    </div>
  );
};

export default SearchBar;

