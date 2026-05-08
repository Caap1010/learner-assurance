export async function withLatency<T>(payload: T, delayMs = 300): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return payload;
}
