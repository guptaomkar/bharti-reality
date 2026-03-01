import React from "react";
import { Menu } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import "./ProfileMenu.css";

const ProfileMenu = ({ user, logout }) => {
    const navigate = useNavigate();

    // Initials avatar fallback
    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    return (
        <Menu position="bottom-end" offset={8}>
            <Menu.Target>
                <div className="pm-avatar" title={user?.name}>
                    {initials}
                    {user?.role === "admin" && <span className="pm-admin-dot" title="Admin" />}
                </div>
            </Menu.Target>

            <Menu.Dropdown className="pm-dropdown">
                <div className="pm-user-info">
                    <span className="pm-name">{user?.name}</span>
                    <span className="pm-role">{user?.role === "admin" ? "Administrator" : "Member"}</span>
                </div>

                <Menu.Divider />

                <Menu.Item className="pm-item" onClick={() => navigate("/favourites")}>
                    Favourites
                </Menu.Item>
                <Menu.Item className="pm-item" onClick={() => navigate("/bookings")}>
                    Bookings
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                    className="pm-item pm-item--logout"
                    onClick={() => { logout(); navigate("/"); }}
                >
                    Sign Out
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default ProfileMenu;