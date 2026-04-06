import { db } from './db';
import { PrismaClient } from '@prisma/client';

type ModelName = keyof Omit<PrismaClient,
    '$connect'|'$disconnect'|'$on'|'$transaction'|'$use'|'$extends'
>;

const collectionMap: Record<string, ModelName> = {
    'students':        'student',
    'trainers':        'trainer',
    'courses':         'course',
    'classrooms':      'classroom',
    'inscriptions':    'inscription',
    'matriculations':  'matriculation',
    'companies':       'company',
    'feedbacks':       'feedback',
    'activity-logs':   'activityLog',
    'attendance':      'attendance',
    'materials':       'material',
    'adminusers':      'adminUser',
    'summaries':       'summary',
    'grades':          'grade',
};

export function getModel(collection: string) {
    const modelName = collectionMap[collection];
    if (!modelName) return null;
    return (db as any)[modelName];
}
