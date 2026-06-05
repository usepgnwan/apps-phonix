export default function CustomerCard({ children, className = '' }) {
    return (
        <section
            className={`rounded-3xl border border-outline-variant/80 bg-white shadow-sm shadow-primary-container/5 ${className}`}
        >
            {children}
        </section>
    );
}
