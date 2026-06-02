import re

with open('landing_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
if body_match:
    body = body_match.group(1)
    
    # remove scripts
    body = re.sub(r'<script.*?>.*?</script>', '', body, flags=re.DOTALL)
    
    # HTML comments
    body = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', body, flags=re.DOTALL)
    
    # replace class with className
    body = body.replace('class="', 'className="')
    
    # replace for with htmlFor
    body = body.replace('for="', 'htmlFor="')
    
    # close img tags
    body = re.sub(r'(<img[^>]*?)(?<!/)>', r'\1 />', body)
    
    # close input tags
    body = re.sub(r'(<input[^>]*?)(?<!/)>', r'\1 />', body)
    
    # fix inline styles
    def style_replacer(match):
        style_str = match.group(1)
        styles = []
        for prop in style_str.split(';'):
            prop = prop.strip()
            if not prop: continue
            key, val = prop.split(':', 1)
            key = key.strip()
            val = val.strip()
            parts = key.split('-')
            key = parts[0] + ''.join(x.title() for x in parts[1:])
            val = val.replace("'", '"')
            styles.append(f"{key}: '{val}'")
        return 'style={{' + ', '.join(styles) + '}}'
        
    body = re.sub(r'style="([^"]*)"', style_replacer, body)
    
    # fix onclick
    def onclick_replacer(match):
        code = match.group(1)
        return 'onClick={() => { ' + code + ' }}'
    body = re.sub(r'onclick="([^"]*)"', onclick_replacer, body)

    # fix onsubmit
    def onsubmit_replacer(match):
        code = match.group(1)
        return 'onSubmit={(event) => { ' + code + ' }}'
    body = re.sub(r'onsubmit="([^"]*)"', onsubmit_replacer, body)

    react_component = f"""import {{ Head, Link }} from '@inertiajs/react';
import {{ useEffect }} from 'react';

export default function Welcome() {{
    useEffect(() => {{
        const handleScroll = () => {{
            const nav = document.querySelector('nav');
            if (nav) {{
                if (window.scrollY > 50) {{
                    nav.classList.add('shadow-md');
                    nav.classList.remove('shadow-sm');
                }} else {{
                    nav.classList.add('shadow-sm');
                    nav.classList.remove('shadow-md');
                }}
            }}
        }};

        window.addEventListener('scroll', handleScroll);

        const elements = document.querySelectorAll('.hover\\\\:shadow-xl, .group\\\\/card');
        elements.forEach((el, index) => {{
            if(el) {{
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'all 0.6s ease-out';
                setTimeout(() => {{
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }}, 50 * index);
            }}
        }});

        return () => window.removeEventListener('scroll', handleScroll);
    }}, []);

    return (
        <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
            <Head title="Phoenix Terapi & Herbal" />
            {body}
        </div>
    );
}}
"""
    with open('resources/js/Pages/Welcome.jsx', 'w', encoding='utf-8') as f:
        f.write(react_component)
    print("Welcome.jsx updated successfully.")
