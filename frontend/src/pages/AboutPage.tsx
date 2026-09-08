import Layout from "../components/layout/Layout";

export default function AboutPage() {
    return (
        <Layout>
            <div className="p-6 md:p-16 space-y-16">
                
                <header className="pb-4 flex justify-center">
                    <h1 className="text-[28px] lg:text-[40px] font-bold">About OpenDeals</h1>
                </header>

                <section className="text-[16px] lg:text-[20px] leading-relaxed font-bold">
                    <p>
                        OpenDeals is a community-focused marketplace where users can discover, share, and save great deals on everyday products. Built to make bargain hunting simple and collaborative, the app helps people find the best offers while keeping the experience clean, fast, and easy to use.
                    </p>
                </section>

                <footer className="pt-4">
                    <a 
                        href="https://github.com/21Yu/OpenDeals" 
                        target="_blank" 
                        rel="noreferrer"
                        className="block text-center w-full py-4 font-bold bg-rose-300 hover:bg-rose-200 hover:bg-indigo-300"
                    >
                        View source code on GitHub
                    </a>
                </footer>

            </div>
        </Layout>
    );
}