export class DefineOptionService {
    
    static async upsertOption(key: string, value: string) {
        await prisma.defineOption.upsert({
            where: {
                key_value: { key, value }
            },
            create: {
                key, value
            },
            update: {}
        })
    }
}