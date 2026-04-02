import { z } from 'zod';

export const studentSchema = z.object({
    name:        z.string().min(2).max(100),
    email:       z.string().email().optional().nullable(),
    phone:       z.string().max(20).optional().nullable(),
    bi:          z.string().max(20).optional().nullable(),
    nationality: z.string().max(50).optional().nullable(),
    status:      z.enum(['Ativo','Inativo']).optional(),
});

export const inscriptionSchema = z.object({
    name:    z.string().min(2).max(100),
    email:   z.string().email().optional().nullable(),
    phone:   z.string().max(20).optional().nullable(),
    course:  z.string().max(100).optional().nullable(),
    message: z.string().max(1000).optional().nullable(),
});

export const trainerSchema = z.object({
    name:      z.string().min(2).max(100),
    email:     z.string().email().optional().nullable(),
    phone:     z.string().max(20).optional().nullable(),
    specialty: z.string().max(100).optional().nullable(),
    status:    z.enum(['Ativo','Inativo']).optional(),
});

export const courseSchema = z.object({
    title:       z.string().min(2),
    description: z.string().optional().nullable(),
    duration:    z.string().optional().nullable(),
    category:    z.string().optional().nullable(),
    status:      z.string().optional(),
    trainerId:   z.string().optional().nullable(),
    trainerName: z.string().optional().nullable(),
    startDate:   z.string().optional().nullable(),
    endDate:     z.string().optional().nullable(),
});

export const classroomSchema = z.object({
    name:         z.string().min(1),
    capacity:     z.number().or(z.string().transform(n => Number(n))).optional().nullable(),
    location:     z.string().optional().nullable(),
    description:  z.string().optional().nullable(),
    availability: z.string().optional(),
});

export const companySchema = z.object({
    name:          z.string().min(2),
    email:         z.string().email().optional().nullable(),
    phone:         z.string().optional().nullable(),
    address:       z.string().optional().nullable(),
    nif:           z.string().optional().nullable(),
    description:   z.string().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    logo:          z.string().optional().nullable(),
});

export const schemas: Record<string, z.ZodObject<any>> = {
    'students': studentSchema,
    'inscriptions': inscriptionSchema,
    'trainers': trainerSchema,
    'courses': courseSchema,
    'classrooms': classroomSchema,
    'companies': companySchema,
};
