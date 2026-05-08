import { withLatency } from "./httpClient";

export async function listGoals() {
    return withLatency({ success: true, data: [] as unknown[] });
}
