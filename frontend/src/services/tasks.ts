import { withLatency } from "./httpClient";

export async function listTasks() {
    return withLatency({ success: true, data: [] as unknown[] });
}
