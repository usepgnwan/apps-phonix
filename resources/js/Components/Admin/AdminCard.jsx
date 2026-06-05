export default function AdminCard({ children, className = '' }) {
    return (
        <section
            className={`rounded-3xl border border-[#E5E7EB] bg-white shadow-sm shadow-[#1E4D3A]/5 ${className}`}
        >
            {children}
        </section>
    );
}
