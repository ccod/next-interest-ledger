import Link from "next/link"
import { api } from "~/utils/api"
import { useRouter } from "next/router"

interface RawAccountForm {
    name: string,
    principle: string,
    interest: string,
    startDate: string,
    incrementRate: string,
    interestInterval: string,
}

interface AccountForm {
    name: string,
    principle: number,
    interest: number,
    startDate: Date,
    incrementRate: string,
    interestInterval: string,
}

function convertToAccount(rawFormData: RawAccountForm): AccountForm {
    return {
        name: rawFormData.name, 
        principle: parseFloat(rawFormData.principle),
        interest: parseFloat(rawFormData.interest),
        startDate: new Date(rawFormData.startDate + 'T12:00:00'),
        incrementRate: rawFormData.incrementRate,
        interestInterval: rawFormData.interestInterval,
    }
}

export default function InterestAccountForm() {
    const router = useRouter()
    const mutation = api.interestAccount.addAccount.useMutation()
    let form: HTMLFormElement

    function getForm(node: null | HTMLFormElement) {
        if (node !== null) {
            form = node
        }
    }

    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()

        let data: any = {}
        const formData = new FormData(form)
        formData.forEach((val, key) => (data[key] = val))
        const account = convertToAccount(data as RawAccountForm)

        mutation.mutate(account)

        if (mutation.error) {
            console.log(mutation.error.message)
        } else {
            router.push('/')
        }

    }

    return (
        <form ref={getForm} className="p-2" style={{width: '350px'}} onSubmit={handleSubmit}>
            <div className="flex flex-col">
                <label className="font-semibold text-slate-700 mb-2">Account Name</label>
                <input name="name" type="text" className="p-1 pl-2 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" required/>
            </div>

            <div className="flex flex-row gap-2 mt-4">
                <div className="flex flex-col grow">
                    <label className="font-semibold text-slate-700 mb-2">Principle Amount</label>
                    <input name="principle" pattern="[0-9]*(?:.[0-9]{1,2})?" className="p-1 pl-2 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" required/>
                </div>
                <div className="flex flex-col">
                    <label className="font-semibold text-slate-700 mb-2">Interest Rate</label>
                    <input name="interest" type="number" className="p-1 pl-2 w-24 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" required/>
                </div>
            </div>

            <div className="flex flex-col mt-4">
                <label className="font-semibold text-slate-700 mb-2">Start Date</label>
                <input name="startDate" type="date" className="p-1 pl-2 w-40 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" required/>
            </div>

            <div className="flex flex-col mt-4 mb-2 gap-2">
                <label className="font-semibold text-slate-700">Choose Interest Increase Rate</label>
                <div className="flex flex-row bg-slate-200 gap-2 pl-2">
                    <input id="rate-inc-0" name="incrementRate" type="radio" value="flat" required/>
                    <label htmlFor="rate-inc-0" className="w-full pt-2 pb-2 text-slate-700">Flat</label>
                </div>
                <div className="flex flex-row bg-slate-200 gap-2 pl-2">
                    <input id="rate-inc-1" name="incrementRate" type="radio" className="" value="inc-once" required/>
                    <label htmlFor="rate-inc-1" className="w-full pt-2 pb-2 text-slate-700">Increment Once</label>
                </div>
                <div className="flex flex-row bg-slate-200 gap-2 pl-2">
                    <input id="rate-inc-2" name="incrementRate" type="radio" value="inc-each" required/>
                    <label htmlFor="rate-inc-2" className="w-full pt-2 pb-2 text-slate-700">Increment Each Year</label>
                </div>
            </div>

            <label className="font-semibold text-slate-700 mt-4 block">Choose Charge Option</label>
            <div className="flex flex-row gap-2 border-slate-50 mt-2">
                <div className="relative">
                    <input id="monthly" type="radio" name="interestInterval" value="monthly" className="peer absolute opacity-0 z-0 top-2 left-2" required />
                    <label htmlFor="monthly" className="cursor-pointer bg-slate-200 text-center  w-24 pt-2 pb-2 block text-slate-700 font-semibold border-solid border-2 border-slate-200 peer-focus:border-blue-500 peer-checked:border-slate-500">Monthly</label> 
                </div>
                <div className="relative">
                    <input id="yearly" type="radio" name="interestInterval" value="yearly" className="peer absolute opacity-0 z-0 top-2 left-2" required />
                    <label htmlFor="yearly" className="cursor-pointer bg-slate-200 text-center  w-24 pt-2 pb-2 block text-slate-700 font-semibold border-solid border-2 border-slate-200 peer-focus:border-blue-500 peer-checked:border-slate-500">Yearly</label> 
                </div>
            </div>

            <div className="flex flex-row-reverse gap-2 mt-8">
                <button className="p-2 font-bold text-slate-50 bg-slate-800 rounded-md" type="submit">CREATE</button>
                <Link href="/" tabIndex={0} className="p-2 font-bold text-slate-800 bg-slate-200 rounded-md" type="reset">CANCEL</Link>
            </div>
        </form>
    )
}

