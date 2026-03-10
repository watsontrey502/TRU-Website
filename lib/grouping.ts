import type { AttendeeProfile, GroupAssignment } from "@/lib/types/live-event";

interface ScoredGroup {
  members: string[];
  genders: (string | null)[];
  neighborhoods: (string | null)[];
}

/**
 * Generate balanced small groups for multiple rounds.
 * Optimizes for gender diversity, neighborhood mixing, and zero repeat pairings.
 */
export function generateGroups(
  attendees: AttendeeProfile[],
  numRounds: number,
  eventId: string,
  groupSize = 4
): GroupAssignment[] {
  const n = attendees.length;
  if (n === 0) return [];

  // Track all pairs across rounds to prevent repeats
  const pairedWith = new Map<string, Set<string>>();
  for (const a of attendees) {
    pairedWith.set(a.id, new Set());
  }

  const assignments: GroupAssignment[] = [];

  for (let round = 0; round < numRounds; round++) {
    const numGroups = Math.ceil(n / groupSize);
    const groups: ScoredGroup[] = Array.from({ length: numGroups }, () => ({
      members: [],
      genders: [],
      neighborhoods: [],
    }));

    // Interleave by gender for diverse seeding
    const shuffled = shuffleArray([...attendees]);
    const males = shuffled.filter((a) => a.gender?.toLowerCase() === "male");
    const females = shuffled.filter((a) => a.gender?.toLowerCase() === "female");
    const others = shuffled.filter(
      (a) => a.gender?.toLowerCase() !== "male" && a.gender?.toLowerCase() !== "female"
    );

    const interleaved: AttendeeProfile[] = [];
    let mi = 0, fi = 0, oi = 0;
    while (mi < males.length || fi < females.length || oi < others.length) {
      if (fi < females.length) interleaved.push(females[fi++]);
      if (mi < males.length) interleaved.push(males[mi++]);
      if (oi < others.length) interleaved.push(others[oi++]);
    }

    // Assign each person to the group with the lowest penalty
    for (const person of interleaved) {
      let bestGroup = 0;
      let bestScore = Infinity;

      for (let g = 0; g < numGroups; g++) {
        const group = groups[g];

        // Skip full groups
        const maxSize = g < n % numGroups || n % numGroups === 0 ? groupSize : groupSize - 1;
        // Recalculate: distribute evenly
        const baseSize = Math.floor(n / numGroups);
        const extra = n % numGroups;
        const limit = g < extra ? baseSize + 1 : baseSize;

        if (group.members.length >= limit) continue;

        let score = 0;

        // Heavy penalty for repeat pairings
        const personPairs = pairedWith.get(person.id)!;
        for (const memberId of group.members) {
          if (personPairs.has(memberId)) score += 1000;
        }

        // Penalty for same gender majority
        if (group.members.length > 0) {
          const sameGenderCount = group.genders.filter(
            (g) => g && person.gender && g.toLowerCase() === person.gender.toLowerCase()
          ).length;
          if (sameGenderCount >= Math.ceil(group.members.length / 2)) {
            score += 30;
          }
        }

        // Penalty for same neighborhood
        if (person.neighborhood) {
          const sameNeighborhood = group.neighborhoods.filter(
            (nb) => nb && nb.toLowerCase() === person.neighborhood!.toLowerCase()
          ).length;
          score += sameNeighborhood * 50;
        }

        // Slight preference for smaller groups (balance)
        score += group.members.length * 2;

        if (score < bestScore) {
          bestScore = score;
          bestGroup = g;
        }
      }

      groups[bestGroup].members.push(person.id);
      groups[bestGroup].genders.push(person.gender);
      groups[bestGroup].neighborhoods.push(person.neighborhood);
    }

    // Record pairs and build assignments
    for (let g = 0; g < groups.length; g++) {
      const members = groups[g].members;
      for (let i = 0; i < members.length; i++) {
        assignments.push({
          event_id: eventId,
          phase_index: round,
          group_number: g + 1,
          profile_id: members[i],
        });
        for (let j = i + 1; j < members.length; j++) {
          pairedWith.get(members[i])!.add(members[j]);
          pairedWith.get(members[j])!.add(members[i]);
        }
      }
    }
  }

  return assignments;
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
