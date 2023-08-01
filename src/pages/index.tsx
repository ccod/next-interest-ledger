import { useSession } from "next-auth/react";
import InterestAccountList from "~/components/InterestAccountList";
import Layout from "~/components/Layout";

export default function Home() {
    const { data: sessionData } = useSession()

    if (sessionData) {
        return (
            <Layout>
                <div className="my-8"></div>
                <InterestAccountList />
            </Layout>
        )       
    } else {
        return (
            <Layout>
                <div className="w-[560px] mt-16">
                    <h1 className="text-2xl text-slate-800 font-bold">Compound Interest Ledger</h1>
                </div>
            </Layout>
        )
    }
}
