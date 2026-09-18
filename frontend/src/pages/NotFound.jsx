import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" />
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="aperture mx-auto mb-8">
          <span className="blade" /><span className="blade" /><span className="blade" />
          <span className="blade" /><span className="blade" /><span className="blade" />
        </div>
        <p className="eyebrow mb-4">404</p>
        <h1 className="font-display text-4xl text-ink mb-4">This frame doesn't exist.</h1>
        <p className="text-ink-soft text-sm mb-8 max-w-sm">The page you're looking for may have been moved or never developed.</p>
        <Link to="/" className="px-7 py-3 bg-ink text-bg-soft text-[13px] font-semibold tracking-[0.12em] uppercase rounded-full hover:bg-gold-dark transition-colors">
          Back Home
        </Link>
      </section>
    </>
  );
}
