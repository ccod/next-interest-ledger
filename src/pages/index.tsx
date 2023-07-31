import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";
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

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-slate-800 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
