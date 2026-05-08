import { mockAttendance } from "../data/mockData";
import type { ApiEnvelope, AttendanceRecord } from "../types/contracts";
import { withLatency } from "./httpClient";

export async function listAttendance(): Promise<ApiEnvelope<AttendanceRecord[]>> {
    return withLatency({ success: true, data: mockAttendance });
}
