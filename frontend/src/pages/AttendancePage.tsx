import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "../components/common/FormField";

const attendanceSchema = z.object({
    learnerId: z.string().min(3, "Learner ID is required"),
    attendanceDate: z.string().min(1, "Date is required"),
});

type AttendanceForm = z.infer<typeof attendanceSchema>;

export function AttendancePage() {
    const { register, handleSubmit, formState } = useForm<AttendanceForm>({
        resolver: zodResolver(attendanceSchema),
    });

    const onSubmit = (data: AttendanceForm) => {
        // Sprint 1 uses placeholder submission until backend wiring begins.
        window.alert(`Attendance captured for ${data.learnerId} on ${data.attendanceDate}`);
    };

    return (
        <section className="panel">
            <h2>Attendance Submission</h2>
            <p>Standard attendance capture with policy-ready validation.</p>
            <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
                <FormField
                    label="Learner ID"
                    placeholder="L-1001"
                    registration={register("learnerId")}
                    error={formState.errors.learnerId}
                />
                <FormField
                    label="Attendance Date"
                    placeholder="2026-05-08"
                    registration={register("attendanceDate")}
                    error={formState.errors.attendanceDate}
                />
                <button type="submit">Submit Attendance</button>
            </form>
        </section>
    );
}
