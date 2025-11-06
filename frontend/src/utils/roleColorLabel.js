export const getRoleColor = (role) => {
    const colors = {
        admin: "bg-red-100 text-red-800 border-red-200",
        base_commander: "bg-blue-100 text-blue-800 border-blue-200",
        logistics_officer: "bg-green-100 text-green-800 border-green-200",
        user: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[role] || colors.user
}

export const getRoleLabel = (role) => {
    const labels = {
        admin: "Admin",
        base_commander: "Base Commander",
        logistics_officer: "Logistics Officer",
        user: "User",
    }
    return labels[role] || role
}