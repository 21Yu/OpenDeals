import Layout from "../components/layout/Layout";

export default function AboutPage() {
    return (
        <Layout>
            <div className="about-page">
                
                <header className="about-heading">
                    <p className="eyebrow">A BETTER WAY TO BARGAIN HUNT</p>
                    <h1>OpenDeals, <em>open to all.</em></h1>
                </header>

                <section className="about-copy">
                    <p>
                        OpenDeals is a community-focused marketplace where users can discover, share, and save great deals on everyday products. Built to make bargain hunting simple and collaborative, the app helps people find the best offers while keeping the experience clean, fast, and easy to use.
                    </p>
                </section>

                <footer className="pt-4">
                    <a
                        href="https://github.com/21Yu/OpenDeals" 
                        target="_blank" 
                        rel="noreferrer"
                        className="source-link"
                    >
                        View source code on GitHub <span aria-hidden="true">↗</span>
                    </a>
                </footer>

            </div>
        </Layout>
    );
}