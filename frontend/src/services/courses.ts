import { withLatency } from "./httpClient";

export async function listCourseAssignments() {
    return withLatency({ success: true, data: [] as unknown[] });
}
