// Schema de validação para o formulário de reporte
import { z } from "zod/v4"

export const reportFormSchema = z.object({
  // Step 1: Location
  locationId: z.string().min(1, "Selecione um local"),

  // Step 2: Category
  categoryId: z.string().min(1, "Selecione uma categoria"),

  // Step 3: Report Details
  title: z.string()
    .min(10, "O título deve ter pelo menos 10 caracteres")
    .max(255, "O título não pode ter mais de 255 caracteres")
    .trim(),

  description: z.string()
    .min(20, "A descrição deve ter pelo menos 20 caracteres")
    .max(2000, "A descrição não pode ter mais de 2000 caracteres")
    .trim(),

  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
})

export type ReportFormData = z.infer<typeof reportFormSchema>

// Schema parcial para cada step
export const step1Schema = reportFormSchema.pick({ locationId: true })
export const step2Schema = reportFormSchema.pick({ categoryId: true })
export const step3Schema = reportFormSchema.pick({ title: true, description: true, imageUrl: true })

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
