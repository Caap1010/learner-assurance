import { withLatency } from "./httpClient";

export async function listCoachingSessions() {
    return withLatency({ success: true, data: [] as unknown[] });
}
