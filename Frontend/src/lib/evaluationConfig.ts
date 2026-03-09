// Shared evaluation configuration that syncs with Evaluation Settings page

export interface SavannahValue {
  id: string;
  event: string;
  tokens: number;
  description: string;
}

// Default Savannah values (same as in EvaluationSettings.tsx)
const defaultSavannahValues: SavannahValue[] = [
  { id: "1", event: "Community Meeting Presentation", tokens: 150, description: "Present community service initiatives to peers" },
  { id: "2", event: "Adwa Week Presentation", tokens: 100, description: "Cultural celebration and heritage activities" },
  { id: "3", event: "Science Fair Project", tokens: 200, description: "Showcase innovative science research" },
  { id: "4", event: "Student Council Meeting Attendance", tokens: 75, description: "Active participation in governance" },
  { id: "5", event: "Volunteer Work (per hour)", tokens: 25, description: "Community service hours" },
  { id: "6", event: "Workshop Participation", tokens: 50, description: "Attend leadership development workshops" },
  { id: "7", event: "Debate Competition", tokens: 125, description: "Compete in official debates" },
  { id: "8", event: "Sports Event Organization", tokens: 100, description: "Help organize school sports events" },
  { id: "9", event: "Tutoring Sessions (per hour)", tokens: 30, description: "Peer-to-peer academic support" },
  { id: "10", event: "Club Leadership Role", tokens: 150, description: "Serve as club president or officer" },
];

/**
 * Get stored Savannah values from localStorage or return defaults
 */
export const getSavannahValues = (): SavannahValue[] => {
  const stored = localStorage.getItem("savannahValues");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultSavannahValues;
    }
  }
  return defaultSavannahValues;
};

/**
 * Get the base tokens for Community Meeting Presentation
 */
export const getCommunityMeetingBaseTokens = (): number => {
  const values = getSavannahValues();
  const communityMeeting = values.find(v => v.event === "Community Meeting Presentation");
  return communityMeeting?.tokens ?? 150;
};
