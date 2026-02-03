type Rates = Record<'USD' | 'VND', number>
type ChangeRate = {
    time: number,
    rates: Rates
}

export function priceToVND(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function priceToUSD(value: number) {
  const hasDecimal = !Number.isInteger(value);
 
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}


export function convertMoney(value: number, locale = 'us') {
    if (locale === 'us') {
        return `$${value}`
    }
}

export function changeRate() {
    const LOCAL_STORAGE_KEY = 'RATE_DATA'
    const defaultRates: Rates = {
        USD: 1,
        VND: 26163.16892
    }

    async function fetch(): Promise<ChangeRate | null> {
        let data: ChangeRate | null = null
        await $fetch('https://open.er-api.com/v6/latest/USD', {
            onResponse({ response }) {
                if (response.ok && response._data && "result" in response._data && response._data.result === 'success' && "base_code" in response._data && response._data.base_code === 'USD') {
                    try {
                        data = {
                            time: (response._data as any)?.time_last_update_unix,
                            rates: {
                                USD: response._data?.rates.USD,
                                VND: response._data?.rates.VND,
                            }
                        }
                        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
                    } catch (e) { }
                }
            }
        })

        return data
    }

    function isExpiredDateOnly(unixTime: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const date = new Date(unixTime * 1000);
        date.setHours(0, 0, 0, 0);

        return date < today;
    }


    async function get(): Promise<Rates> {
        const lsValue = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (lsValue) {
            try {
                const data = JSON.parse(lsValue) as ChangeRate
                if (!isExpiredDateOnly(data.time)) {
                    return data.rates
                }
            } catch (e) { }
        }

        const internet = await fetch()
        if (internet) {
            return internet.rates
        } else {
            return defaultRates
        }

    }

    function convert(amount: number, fromRate: number, toRate: number) {
        return amount * (toRate / fromRate);
    }

    return {
        get,
        convert
    }
}