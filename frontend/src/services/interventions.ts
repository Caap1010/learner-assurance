import { withLatency } from "./httpClient";

export async function listInterventions() {
    return withLatency({ success: true, data: [] as unknown[] });
}
