import React from "react";
import { NavLink } from "react-router-dom";
import { NAV_GROUPS } from "@/app/routes/config";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="brand">R3F Examples</div>
      <div className="nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="nav-group">
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
