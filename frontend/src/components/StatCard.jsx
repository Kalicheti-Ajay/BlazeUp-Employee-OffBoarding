import React from "react";

function StatCard({
    title,
    value,
    icon,
    description,
    onClick
}) {
    const renderIcon = () => {
        if (!icon) {
            return null;
        }

        // Dashboard may pass <Users /> as a JSX element
        if (React.isValidElement(icon)) {
            return icon;
        }

        // Or it may pass Users as a component
        if (typeof icon === "function") {
            const Icon = icon;
            return <Icon size={22} />;
        }

        return null;
    };

    return (
        <div
            className={`stat-card ${
                onClick ? "clickable" : ""
            }`}
            onClick={onClick}
        >
            <div className="stat-card-top">

                <div>
                    <p className="stat-card-title">
                        {title}
                    </p>

                    <h2 className="stat-card-value">
                        {value}
                    </h2>

                    {description && (
                        <p className="stat-card-description">
                            {description}
                        </p>
                    )}
                </div>

                {icon && (
                    <div className="stat-card-icon">
                        {renderIcon()}
                    </div>
                )}

            </div>
        </div>
    );
}

export default StatCard;