import { mockLearners } from "../data/mockData";
import type { ApiEnvelope, Learner } from "../types/contracts";
import { withLatency } from "./httpClient";

export async function listLearners(): Promise<ApiEnvelope<Learner[]>> {
    return withLatency({ success: true, data: mockLearners });
}
