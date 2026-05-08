import { withLatency } from "./httpClient";

export async function listAppraisals() {
    return withLatency({ success: true, data: [] as unknown[] });
}
