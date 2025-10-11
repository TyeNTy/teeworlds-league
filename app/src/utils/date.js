const timeUntilNow = (date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 1000 * 60) {
    // less than 1 minute
    const secs = Math.floor(diff / 1000);
    return `${secs}s ago`;
  } else if (diff < 1000 * 60 * 60) {
    // less than 1 hour
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m ago`;
  } else if (diff < 1000 * 60 * 60 * 24) {
    // less than 1 day
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h ago`;
  } else if (diff < 1000 * 60 * 60 * 24 * 30) {
    // less than 1 month (approximate)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}d ago`;
  } else {
    // more than a month, show in months (approximate)
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    return `${months}mo ago`;
  }
};

const displayDateWithTimeUntilNow = (date) => {
  return (
    date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) +
    " (" +
    timeUntilNow(date) +
    ")"
  );
};

export { displayDateWithTimeUntilNow };
