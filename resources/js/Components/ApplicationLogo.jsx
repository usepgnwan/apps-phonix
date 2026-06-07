export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            src="/images/logoo.png"
            alt="Phoenix Logo"
            className={`${className} object-contain`}
            {...props}
        />
    );
}
