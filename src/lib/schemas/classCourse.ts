// lib/schemas/classCourse.ts
import { z } from "zod";

export const assignTeacherSchema = z.object({
  classCourseId: z.string().min(1, "شناسه درس کلاس الزامی است"),
  teacherId: z.string().min(1, "معلم را انتخاب کنید"),
});

export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>;
