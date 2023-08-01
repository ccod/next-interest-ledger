import Layout from "~/components/Layout";
import { api } from "~/utils/api"
import { useRouter } from "next/router";

export default function CreateInterestAccount() {
    const router = useRouter()
    const { data, isLoading } = api.interestAccount.getAccount.useQuery({ id: router.query.id as string })


    function addMonth(date: Date, amount: number) {
        const tempDate = new Date(date)
        tempDate.setMonth(tempDate.getMonth() + amount)
        return tempDate
    }

    function genAdjustedInterestRate(interest: number, rate: string) {
        return (month: number) => {
            if (rate == 'flat') {
                return interest
            }

            if (rate == 'inc-once') {
                if (month > 12) {
                    return interest + 1
                } else {
                    return interest
                }
            }

            if (rate == 'inc-each') {
                const year = Math.floor(month / 12)
                return interest + year 
            }
        }
    }

    function nextPeriod(frequency: string, month: number, interestFn: Function): any {
        if (frequency == 'monthly') {
            return { period: 1, interest: interestFn(month) / 12 }
        } else {
            return { period: 12, interest: interestFn(month) }
        }
    }

    function generateInterestPeriods(account: any) {
        let currentMonth = 0
        let currentDate = addMonth(data!.startDate, 0)
        const todayDate = new Date()
        const entries = []
        const adjustedRate = genAdjustedInterestRate(account.interest, account.incrementRate)

        while (currentDate < todayDate) {
            const currentPeriod = nextPeriod(account.frequency, currentMonth, adjustedRate)
            entries.push({
                date: currentDate, interest: currentPeriod.interest
            })

            currentMonth += currentPeriod.period
            currentDate = addMonth(currentDate, currentPeriod.period)
        }

        return entries
    }

    function sortByDate(items: any) {
        items.sort((a: any, b: any) => {
                if (a.date < b.date) {
                    return -1
                }
                if (a.date > b.date) {
                    return 1
                }
                if (a.date == b.date) {
                    return 0
                }
        })
        return items
    }


    function runningEntries(entries: any) {
        if (!data) { return [] }

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD'
        })

        let currentTotal = data.principle

        function interestToLedgerItem(entry: any) {
            const credit = currentTotal * (entry.interest / 100)
            const holdTotal = currentTotal
            currentTotal += credit
            return { 
                date: entry.date, 
                credit: formatter.format(credit),
                total: formatter.format(currentTotal),
                description: `${formatter.format(holdTotal)} * ${entry.interest / 100}`
            }
        }

        return entries.map((entry: any) => {
            if (entry.interest) {
                return interestToLedgerItem(entry)
            }

            if (entry.entryType == 'debit') {
                currentTotal -= entry.amount
                return { ...entry, debit: formatter.format(entry.amount), total: formatter.format(currentTotal) }

            } else {
                currentTotal += entry.amount
                return { ...entry, credit: formatter.format(entry.amount), total: formatter.format(currentTotal) }
            }
        })
    }

    function preparedEntries() {
            let entries = generateInterestPeriods(data)
            entries.push(...data?.ledger as any)
            entries = sortByDate(entries)
            entries = runningEntries(entries)

            return entries
    }

    if (isLoading) {
        return (
            <Layout>
                <p>is Loading</p>
            </Layout>
        )
    } else {
        return (
            <Layout>
                <div className="my-8" />
                <AccountCard account={data} />
                <LedgerForm accountId={router.query.id} />
                <div className="my-8" />
                <LedgerTable entries={preparedEntries()}/>
                <div className="mb-24" />
            </Layout>
        )
    }
}


function AccountCard({ account }: any) {
    return (
        <section className="flex flex-col mb-16 gap-4">
            <label className="text-slate-800 font-semibold text-2xl">Account Details</label>
            <div className="flex flex-row">
                <div className="flex flex-col justify-end">
                    <label className="block w-20 mr-2 text-slate-600">Name:</label>
                </div>
                <div className="flex flex-col justify-end">
                    <label className="block text-slate-800 text-xl">{ account.name }</label>
                </div>
            </div>
            <div className="flex flex-row">
                <div className="flex flex-col justify-end">
                    <label className="block w-20 mr-2 text-slate-600">Principle:</label>
                </div>
                <div className="flex flex-col justify-end">
                    <label className="block w-26 text-slate-800 text-xl">{ account.principle }</label>
                </div>
                <div className="ml-4 flex flex-col justify-end">
                    <label className="block w-16 mr-2 text-slate-600">interest:</label>
                </div>
                <div>
                    <label className="text-slate-800 text-xl">{ account.interest }%</label>
                </div>
            </div>
            <div className="flex flex-row">
                <div className="flex flex-col justify-end">
                    <label className="block w-20 mr-2 text-slate-600">Start Date:</label>
                </div>
                <div className="flex flex-col justify-end">
                    <label className="text-slate-800 text-xl">{ account.startDate.toLocaleDateString('en-US') }</label>
                </div>
                <div className="flex flex-col justify-end">
                    <label className="block ml-4 mr-2 text-slate-600">Increment Rate:</label>
                </div>
                <div className="flex flex-col justify-end">
                    <label className="text-slate-800 text-xl">{ account.incrementRate }</label>
                </div>
                <div className="flex flex-col justify-end">
                    <label className="block ml-4 mr-2 text-slate-600">Frequency:</label>
                </div>
                <div className="flex flex-col justify-end">
                    <label className="text-slate-800 text-xl">{ account.interestInterval }</label>
                </div>
            </div>
        </section>
    )
}



function convertToEntry(data: any, id: string) {
    return {
        interestAccountId: id,
        date: new Date(data.date + 'T12:00:00'),
        amount: parseFloat(data.amount),
        entryType: data.entryType
    }

}

function LedgerForm({ accountId }: any) {
    const utils = api.useContext()
    const mutation = api.ledger.addLedgerItem.useMutation()

    let form: HTMLFormElement
    let dateNode: HTMLInputElement

    function getForm(node: null | HTMLFormElement) {
        if (node !== null) {
            form = node
        }
    }

    function getInput(node: any) {
        if (node !== null) {
            dateNode = node
        }
    }

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()

        const data: any = {}
        const formData = new FormData(form)
        formData.forEach((val, key) => (data[key] = val))
        const ledgerEntry = convertToEntry(data, accountId)

        const fetchedData = await mutation.mutateAsync(ledgerEntry)

        if (fetchedData) {
            void utils.invalidate()
        }

        if (mutation.error) {
            console.log(mutation.error.message)
        } else {
            form.reset()
            dateNode.focus()
            console.log('after success, ledger response: ', fetchedData)
        } 
    }

    return (
        <div>
            <label className="block text-2xl font-semibold text-slate-800 mb-4">Ledger Form</label>
            <form ref={getForm} onSubmit={handleSubmit} className="flex flex-row gap-2">
                <fieldset className="flex flex-col">
                    <label className="font-semibold text-slate-700 mb-2">Date</label>
                    <input ref={getInput} type="date" className="p-1 pl-2 w-40 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" name="date" required/>
                </fieldset>
                <fieldset className="flex flex-col">
                    <label className="font-semibold text-slate-700 mb-2">Amount</label>
                    <input className="p-1 pl-2 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" name="amount" required />
                </fieldset>
                <div className="flex flex-col justify-end">
                    <div className="flex flex-row gap-2 border-slate-50">
                        <fieldset className="relative">
                            <input id="0" type="radio" name="entryType" value="credit" className="peer absolute opacity-0 z-0 top-2 left-2" required />
                            <label htmlFor="0" className="cursor-pointer bg-slate-200 text-center  w-24 pt-1 pb-1 block text-slate-700 font-semibold border-solid border-2 border-slate-200 peer-focus:border-blue-500 peer-checked:border-slate-500 z-10" >CREDIT</label>
                        </fieldset>
                        <fieldset className="relative">
                            <input id="1" type="radio" name="entryType" value="debit" className="peer absolute opacity-0 z-0 top-2 left-2" required/>
                            <label htmlFor="1" className="cursor-pointer bg-slate-200 text-center  w-24 pt-1 pb-1 block text-slate-700 font-semibold border-solid border-2 border-slate-200 peer-focus:border-blue-500 peer-checked:border-slate-500 z-10">DEBIT</label>
                        </fieldset>
                        <fieldset>
                            <button className="ml-4 mt-1 px-4 py-1 font-semibold bg-slate-800 text-slate-50 rounded-md">SUBMIT</button>
                        </fieldset>
                    </div>
                </div>
            </form>
        </div>
    )
}

function LedgerTable({ entries }: any) {
    return (
        <table className="table-auto">
            <thead>
                <tr className="text-slate-800">
                    <th>Date</th>
                    <th>Credit</th>
                    <th>Debit</th>
                    <th>Total</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {entries.map((entry: any, idx: number) => <LedgerItem key={idx} entry={entry} />)}
            </tbody>
        </table>
    )
}

function LedgerItem(entry: any) {
    const mutation = api.ledger.deleteLedgerItem.useMutation()
    const utils = api.useContext() 
    const item = entry?.entry

    function handler(id: string) {
        return async () => {
            await mutation.mutateAsync({ id })
            void utils.invalidate()
        }
    }

    function hasDelete() {
        if (item.id) {
            return (
                <button className="font-semibold bg-slate-200 px-2 py-1" onClick={handler(item.id)}>DELETE</button>
            )
        }
    }

    return (
        <tr className="text-slate-600 h-10 even:bg-slate-100">
            <td>{item.date.toLocaleDateString('en-US')}</td>
            <td>{item?.credit || ''}</td>
            <td>{item.debit || ''}</td>
            <td>{item?.total}</td>
            <td>{item.description || ''}</td>
            <td>
                { hasDelete() }
            </td>
        </tr>
    )
}
