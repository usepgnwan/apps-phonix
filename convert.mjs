import fs from 'fs';
import HTMLtoJSX from 'html-to-jsx';
const converter = new HTMLtoJSX({ createClass: false });

let html = fs.readFileSync('landing_page.html', 'utf-8');

// The <script> tags and <style> tags are already handled. We just need the body.
let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (bodyMatch) {
    let body = bodyMatch[1];
    
    // Remove the script tag inside body
    body = body.replace(/<script>[\s\S]*?<\/script>/, '');

    let jsx = converter.convert(body);
    
    const reactComponent = `import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome({ auth }) {
    useEffect(() => {
        const handleScroll = () => {
            const nav = document.querySelector('nav');
            if (nav) {
                if (window.scrollY > 50) {
                    nav.classList.add('shadow-md');
                    nav.classList.remove('shadow-sm');
                } else {
                    nav.classList.add('shadow-sm');
                    nav.classList.remove('shadow-md');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        const elements = document.querySelectorAll('.hover\\\\:shadow-xl, .group\\\\/card');
        elements.forEach((el, index) => {
            if(el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'all 0.6s ease-out';
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 50 * index);
            }
        });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
            <Head title="Phoenix Terapi & Herbal" />
            ${jsx}
        </div>
    );
}
`;
    fs.writeFileSync('resources/js/Pages/Welcome.jsx', reactComponent);
    console.log("Welcome.jsx updated successfully.");
}
