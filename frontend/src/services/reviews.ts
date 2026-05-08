import { withLatency } from "./httpClient";

export async function listPerformanceReviews() {
    return withLatency({ success: true, data: [] as unknown[] });
}
