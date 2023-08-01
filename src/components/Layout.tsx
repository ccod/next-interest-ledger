import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router";

export default function Layout({ children }: any) {
    const router = useRouter()
    console.log('is router base path: ', router.pathname)

    function shouldUnderline() {
        if (router.pathname == '/') {
            return 'underline'
        } else {
            return ''
        }
    }

    return (
        <>
            <Head>
                <title>Compound Interest Ledger</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex flex-row justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col py-2">
                    <div className="flex flex-row justify-between">
                        <Link href="/" className={'text-slate-600 font-semibold ' + shouldUnderline()}>HOME</Link>
                        <AuthButton />
                    </div>
                    { children }
                </div>
            </main>
        </>
    )
}

function AuthButton() {
    const { data: sessionData } = useSession()

    if (sessionData) {
        return (
            <button 
            onClick={() => void signOut()}
            className="bg-slate-300 text-slate-700 font-bold py-1 px-2 rounded-sm"
            >
                SIGN OUT
            </button>
        )
    } else {
        return (
            <button 
                onClick={() => void signIn()}
                className="bg-slate-300 text-slate-700 font-bold py-1 px-2 rounded-sm"
            >
                SIGN IN
            </button>
        )
    }
}

