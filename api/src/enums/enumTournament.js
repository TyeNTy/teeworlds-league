const enumTournamentStageType = {
  GROUP: "group",
  SINGLE_ELIMINATION: "single_elimination",
};

const enumTournamentStageStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  PAUSED: "paused",
  COMPLETED: "completed",
};

const enumTournamentStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

module.exports = { enumTournamentStageType, enumTournamentStageStatus, enumTournamentStatus };
