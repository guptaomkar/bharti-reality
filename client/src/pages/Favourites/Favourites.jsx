import React, { useContext } from "react";
import { useQuery } from "react-query";
import { PuffLoader } from "react-spinners";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import UserDetailContext from "../../context/UserDetailContext";
import { getAllFav } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import useHavenProperties from "../../hooks/useHavenProperties";
import "../Properties/Properties.css";
import "./Favourites.css";

const Favourites = () => {
  const { userDetails: { favourites } } = useContext(UserDetailContext);
  const { user, token, loading: authLoading } = useAuth();

  // Fetch user's favourite IDs from the server
  const { data: favIds = [], isLoading: favLoading } = useQuery(
    ["favIds", user?.email],
    () => getAllFav(user?.email, token),
    { enabled: !!token, refetchOnWindowFocus: false }
  );

  // Use the established hook to fetch and normalise all properties
  const { data: allPropsData, isLoading: propsLoading } = useHavenProperties({ limit: 100 });

  const isLoading = favLoading || propsLoading || authLoading;

  if (authLoading) {
    return (
      <div className="fav-page wrapper flexCenter" style={{ minHeight: "60vh" }}>
        <PuffLoader color="var(--gold)" />
      </div>
    );
  }

  // Not logged in
  if (!token || !user) {
    return (
      <div className="fav-page wrapper flexCenter">
        <div className="fav-login-prompt">
          <span className="fav-heart-big">🤍</span>
          <h2 className="haven-heading fav-title">Your Favourites</h2>
          <p className="secondaryText fav-sub">Sign in to save properties and view your wishlist.</p>
          <Link to="/" className="button fav-login-btn">Sign In</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <PuffLoader color="var(--gold)" />
      </div>
    );
  }

  // Merge: use favIds from API (server-side), fallback to context favourites
  const effectiveFavIds = favIds.length > 0 ? favIds : favourites;

  const favProperties = (allPropsData || []).filter(
    (p) => effectiveFavIds.includes(p.id) || effectiveFavIds.includes(p._id) || effectiveFavIds.includes(p.slug)
  );

  return (
    <div className="fav-page wrapper">
      <div className="flexColCenter paddings innerWidth properties-container">
        <div className="fav-header">
          <span className="haven-label">Personal Collection</span>
          <h1 className="haven-heading fav-main-title">My Favourites</h1>
          {favProperties.length > 0 && (
            <p className="secondaryText">{favProperties.length} saved {favProperties.length === 1 ? "property" : "properties"}</p>
          )}
        </div>

        {favProperties.length === 0 ? (
          <div className="fav-empty">
            <span className="fav-empty-icon">🤍</span>
            <h3 className="fav-empty-title">No favourites yet</h3>
            <p className="secondaryText">Tap the ❤️ on any property to save it here.</p>
            <Link to="/properties" className="button" style={{ marginTop: "1.5rem" }}>Browse Properties</Link>
          </div>
        ) : (
          <div className="paddings props-grid" style={{ width: "100%" }}>
            {favProperties.map((card, i) => (
              <PropertyCard card={card} key={card._id || i} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;
