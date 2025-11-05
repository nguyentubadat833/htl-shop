export function covertMoney(value: number, locale = 'us'){
    if(locale === 'us'){
        return `${value} $`
    }
}