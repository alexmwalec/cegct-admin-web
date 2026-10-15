function shapeReport(row) {
  return {
    id: row.id,
    reportCode: row.id,
    category: row.category_name || row.category,
    severity: row.urgency || "MEDIUM",
    status: row.status,
    location: row.address_text || "Location provided on map",
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    date: row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reporter: row.reporter_name || row.name || "Citizen",
    reporterId: row.user_id,
    officer: row.officer_name || "Unassigned",
    assignedOfficerId: row.assigned_officer_id || null,
    description: row.description || "",
    title: row.title || row.category_name || row.category,
    photoUrl: row.photo_url || null,
  };
}

module.exports = { shapeReport };
