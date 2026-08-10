export function number_with_currency(num: number, currency: string): string {
        return num > 0 ? `${currency}${num}` : `-${currency}${-num}`
}
