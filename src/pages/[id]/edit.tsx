import Link from "next/link"
import { api } from "~/utils/api"
import { useRouter } from "next/router"
import Layout from "~/components/Layout"

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
    const { data, isLoading } = api.interestAccount.getAccount.useQuery({ id: router.query.id as string })
    const mutation = api.interestAccount.editAccount.useMutation()
    let form: HTMLFormElement

    function getForm(node: null | HTMLFormElement) {
        if (node !== null) {
            form = node
        }
    }


    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()

        let tempData: any = {}
        const formData = new FormData(form)
        formData.forEach((val, key) => (tempData[key] = val))
        const account = convertToAccount(tempData as RawAccountForm)

        Object.assign(data as any, account)

        console.log('Data after assignment: ', data)

        mutation.mutate(data as any)

        if (mutation.error) {
            console.log(mutation.error.message)
        } else {
            router.push('/')
        }

    }

    if (isLoading) {
        return (
            <p>... is loading</p>
        )
    }

    return (
        <Layout>
            <div className="my-8"></div>
            <form ref={getForm} className="p-2" style={{width: '350px'}} onSubmit={handleSubmit}>
                <div className="flex flex-col">
                    <label className="font-semibold text-slate-700 mb-2">Account Name</label>
                    <input name="name" defaultValue={data?.name} type="text" className="p-1 pl-2 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" required/>
                </div>

                <div className="flex flex-row gap-2 mt-4">
                    <div className="flex flex-col grow">
                        <label className="font-semibold text-slate-700 mb-2">Principle Amount</label>
                        <input name="principle" defaultValue={String(data?.principle)} pattern="[0-9]*(?:.[0-9]{1,2})?" className="p-1 pl-2 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" required/>
                    </div>
                    <div className="flex flex-col">
                        <label className="font-semibold text-slate-700 mb-2">Interest Rate</label>
                        <input name="interest" defaultValue={String(data?.interest)} type="number" className="p-1 pl-2 w-24 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" required/>
                    </div>
                </div>

                <div className="flex flex-col mt-4">
                    <label className="font-semibold text-slate-700 mb-2">Start Date</label>
                    <input name="startDate" defaultValue={data?.startDate.toLocaleDateString('en-CA')} type="date" className="p-1 pl-2 w-40 rounded-sm text-slate-600 bg-slate-100 border-solid border-2 border-slate-200" required/>
                </div>

                <div className="flex flex-col mt-4 mb-2 gap-2">
                    <label className="font-semibold text-slate-700">Choose Interest Increase Rate</label>
                    <div className="flex flex-row bg-slate-200 gap-2 pl-2">
                        <input id="rate-inc-0" defaultChecked={data?.incrementRate == 'flat'} name="incrementRate" type="radio" value="flat" required/>
                        <label htmlFor="rate-inc-0" className="w-full pt-2 pb-2 text-slate-700">Flat</label>
                    </div>
                    <div className="flex flex-row bg-slate-200 gap-2 pl-2">
                        <input id="rate-inc-1" defaultChecked={data?.incrementRate == 'inc-once'} name="incrementRate" type="radio" className="" value="inc-once" required/>
                        <label htmlFor="rate-inc-1" className="w-full pt-2 pb-2 text-slate-700">Increment Once</label>
                    </div>
                    <div className="flex flex-row bg-slate-200 gap-2 pl-2">
                        <input id="rate-inc-2" defaultChecked={data?.incrementRate == 'inc-each'} name="incrementRate" type="radio" value="inc-each" required/>
                        <label htmlFor="rate-inc-2" className="w-full pt-2 pb-2 text-slate-700">Increment Each Year</label>
                    </div>
                </div>

                <label className="font-semibold text-slate-700 mt-4 block">Choose Charge Option</label>
                <div className="flex flex-row gap-2 border-slate-50 mt-2">
                    <div>
                        <input id="monthly" defaultChecked={data?.interestInterval == 'monthly'} type="radio" name="interestInterval" value="monthly" className="hidden peer" required />
                        <label htmlFor="monthly" className="bg-slate-200 text-center  w-24 pt-2 pb-2 block text-slate-700 font-semibold border-solid border-2 border-slate-200 peer-checked:border-slate-500">Monthly</label> 
                    </div>
                    <div>
                        <input id="yearly" defaultChecked={data?.interestInterval == 'yearly'} type="radio" name="interestInterval" value="yearly" className="hidden peer" required />
                        <label htmlFor="yearly" className="bg-slate-200 text-center  w-24 pt-2 pb-2 block text-slate-700 font-semibold border-solid border-2 border-slate-200 peer-checked:border-slate-500">Yearly</label> 
                    </div>
                </div>

                <div className="flex flex-row-reverse gap-2 mt-8">
                    <button className="p-2 font-bold text-slate-50 bg-slate-800 rounded-md" type="submit">UPDATE</button>
                    <Link href="/" className="p-2 font-bold text-slate-800 bg-slate-200 rounded-md" type="reset">CANCEL</Link>
                </div>
            </form>
        </Layout>
    )
}

