import type { RuntimeSnapshot, CaseEvidence, RuntimeCaseDefinition } from 'runtime/src/types.js';
import type { Specialty, PlayerInfo } from 'runtime/src/server/protocol.js';

/**
 * Determines if evidence is exclusive to a specific specialty based on route_weight.
 * Evidence is exclusive when one route weight is significantly higher than others.
 */
function getExclusiveSpecialty(evidence: CaseEvidence): Specialty | null {
  const { timeline, forensics, behavioral } = evidence.route_weight;
  const total = timeline + forensics + behavioral;
  if (total === 0) return null;

  const threshold = 0.6; // 60% of total weight = exclusive
  if (timeline / total >= threshold) return 'timeline';
  if (forensics / total >= threshold) return 'forensics';
  if (behavioral / total >= threshold) return 'behavioral';

  return null; // Shared evidence
}

/**
 * Filter a snapshot for a specific player's specialty.
 * Removes evidence states, summaries, etc. for evidence exclusive to other specialties.
 */
export function filterSnapshotForPlayer(
  snapshot: RuntimeSnapshot,
  definition: RuntimeCaseDefinition,
  player: PlayerInfo,
  allPlayers: PlayerInfo[],
  isSolo: boolean,
): RuntimeSnapshot {
  // Solo mode: see everything
  if (isSolo) return snapshot;
  // Player with no specialty: see shared only
  const playerSpecialty = player.specialty;

  // Determine which specialties are occupied
  const occupiedSpecialties = new Set<Specialty>();
  for (const p of allPlayers) {
    if (p.specialty) occupiedSpecialties.add(p.specialty);
  }

  // Build a set of evidence IDs this player should NOT see
  const hiddenEvidenceIds = new Set<string>();
  for (const evidence of definition.evidence_list) {
    const exclusive = getExclusiveSpecialty(evidence);
    if (exclusive && exclusive !== playerSpecialty) {
      // If the exclusive specialty is unoccupied (fewer than 3 players), evidence becomes shared
      if (occupiedSpecialties.has(exclusive)) {
        hiddenEvidenceIds.add(evidence.evidence_id);
      }
    }
  }

  if (hiddenEvidenceIds.size === 0) return snapshot;

  // Create a filtered copy
  const filtered: RuntimeSnapshot = {
    ...snapshot,
    evidenceStates: { ...snapshot.evidenceStates },
    evidenceQualities: { ...snapshot.evidenceQualities },
    evidenceInterpretations: { ...snapshot.evidenceInterpretations },
    evidenceSummaries: { ...snapshot.evidenceSummaries },
    evidenceTags: { ...snapshot.evidenceTags },
    evidenceRoles: { ...snapshot.evidenceRoles },
    closureBuckets: {
      verifiedEvidenceIds: snapshot.closureBuckets.verifiedEvidenceIds.filter(id => !hiddenEvidenceIds.has(id)),
      behavioralVerifiedIds: snapshot.closureBuckets.behavioralVerifiedIds.filter(id => !hiddenEvidenceIds.has(id)),
      crossRouteVerifiedIds: snapshot.closureBuckets.crossRouteVerifiedIds.filter(id => !hiddenEvidenceIds.has(id)),
    },
  };

  for (const id of hiddenEvidenceIds) {
    delete filtered.evidenceStates[id];
    delete filtered.evidenceQualities[id];
    delete filtered.evidenceInterpretations[id];
    delete filtered.evidenceSummaries[id];
    delete filtered.evidenceTags[id];
    delete filtered.evidenceRoles[id];
  }

  return filtered;
}
