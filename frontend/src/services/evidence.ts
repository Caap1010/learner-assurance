import { withLatency } from "./httpClient";

export async function listEvidence() {
    return withLatency({ success: true, data: [] as unknown[] });
}
