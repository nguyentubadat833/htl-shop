export function convertMoney(value: number, locale = 'us'){
    if(locale === 'us'){
        return `$${value}`
    }
}