import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function InterestAccountList() {
    const { data: sessionData } = useSession()
    const { data: accounts, isLoading } = api.interestAccount.getAccounts.useQuery(
        undefined,
        { enabled: sessionData?.user !== undefined }
    )

    if (isLoading) {
        return (
            <p>... is loading</p>
        )
    } 


    if (accounts?.length == 0) {
        return (
            <div className="flex flex-col px-8 py-4 " style={{width: "500px"}}>
                <h3 className="text-2xl font-semibold text-slate-800">Currently No Accounts</h3>
                <h4 className="text-slate-600">Get started by creating one!</h4>
                <div className="flex flex-row-reverse mt-4">
                    <div></div>
                    <Link href="/create" className="rounded-md bg-slate-800 font-semibold text-slate-50 pl-4 pr-4 pt-2 pb-2">CREATE</Link>
                </div>
            </div>
        )
    } else {
        return (
            <>
                <div>
                    <Link href="/create" className="rounded-md bg-slate-700 font-semibold text-slate-50 pl-4 pr-4 pt-2 pb-2">CREATE NEW ACCOUNT</Link>
                </div>
                <div className="my-8"></div>
                {accounts?.map((account,idx) => <AccountItem key={idx} account={account} /> )} 
            </>
        )
    }
}


function AccountItem({ account }: any): React.ReactElement {
    const utils = api.useContext()
    const mutation = api.interestAccount.deleteAccount.useMutation()

    function handler(id: string) {
        return async () => {
            const accept = confirm('Are you sure you want to delete?')

            if (accept) {
                await mutation.mutateAsync({ id })
                void utils.invalidate()
            }
        }
    }

    return (
        <div className="flex justify-between px-4 py-2" style={{width: "600px"}}>
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold">{ account.name }</h3>
                <h4 className="text-slate-600">{ account.principle } @ { account.interest }%</h4>
            </div>


            <div className="flex flex-col justify-center">
                <div className="flex flex-row-reverse gap-2">
                    <Link href={'/' + account.id} className="px-4 py-2 font-semibold bg-slate-800 text-slate-50 rounded-md">VIEW</Link>
                    <Link href={'/' + account.id + '/edit'} className="px-4 py-2 font-semibold bg-slate-200 text-slate-800 rounded-md">EDIT</Link>
                    <button className="px-4 py-2 font-semibold text-slate-800 rounded-md" onClick={void handler(account.id)}>DELETE</button>
                </div>
            </div>

        </div>
    )

}


