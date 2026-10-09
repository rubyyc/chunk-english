export type Viewer = {
  id?: string;
  isAdmin: boolean;
  isMember: boolean;
};

export type AccessGate = "visit" | "play" | "audio" | "download" | "shadow";

export type AccessEpisode = {
  isFree: boolean;
};

export function canAccess(viewer: Viewer, episode: AccessEpisode, gate: AccessGate): boolean {
  if (gate === "visit") {
    return true;
  }

  if (gate === "shadow") {
    return Boolean(viewer.id);
  }

  if (gate === "download") {
    return viewer.isAdmin || viewer.isMember;
  }

  return episode.isFree || viewer.isAdmin || viewer.isMember;
}

export function assertAdmin(viewer: Viewer): void {
  if (!viewer.isAdmin) {
    throw new Error("Administrator access is required.");
  }
}
