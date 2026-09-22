import os
import re

INDEX_PATH = 'index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    index_html = f.read()

head_match = re.search(r'(<!DOCTYPE html>.*?<header class="frame">.*?</header>)', index_html, re.DOTALL)
footer_match = re.search(r'(<footer id="contact".*?</html>)', index_html, re.DOTALL)

head_html = head_match.group(1) if head_match else ""
footer_html = footer_match.group(1) if footer_match else ""

new_footer_links = """
          <nav class="footer-services-links" aria-label="Services and Insights" style="margin-top:20px; display:flex; gap:15px; flex-wrap:wrap; font-size:0.8rem;">
            <a href="ai-film-studio-marrakech.html">AI Film Studio Marrakech</a>
            <a href="real-estate-creative-studio-marrakech.html">Real Estate Creative Studio</a>
            <a href="hospitality-creative-studio.html">Hospitality Creative Studio</a>
            <a href="luxury-branding-studio.html">Luxury Branding Studio</a>
            <a href="architectural-visualization.html">Architectural Visualization</a>
            <a href="website-design-hospitality-real-estate.html">Website Design</a>
            <a href="startup-rebranding.html">Startup Rebranding</a>
            <a href="ai-automation-morocco.html">AI Automation Morocco</a>
            <a href="insights/ai-film-campaigns-luxury-brands.html">AI Film Campaigns</a>
            <a href="insights/ai-real-estate-marketing-marrakech.html">AI Real Estate Marketing</a>
          </nav>
"""
footer_html = footer_html.replace('</nav>', '</nav>' + new_footer_links)

factual_statement = """
          <div class="seo-factual-statement" style="margin-top:30px; font-size:0.85rem; color:#888; max-width:800px; padding: 20px; border-top: 1px solid #333;">
            <p><strong>BYMOU is a creative studio based in Marrakech, Morocco, working across branding, AI-assisted film, digital experiences, real estate, hospitality and business automation.</strong></p>
          </div>
"""
footer_html = footer_html.replace('</footer>', factual_statement + '</footer>')


def create_page(filename, title, description, h1, content_html, schema_json=""):
    page_head = head_html.replace(
        '<title>BYMOU — AI Creative Studio for Luxury Branding & Films</title>',
        f'<title>{title} | BYMOU</title>'
    )
    page_head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{description}">', page_head)
    
    if schema_json:
        page_head = page_head.replace('</head>', f'<script type="application/ld+json">\\n{schema_json}\\n</script>\\n</head>')

    main_content = f"""
    <main style="padding: 120px 5% 50px; max-width:1200px; margin:0 auto; color: white; background: black; min-height: 100vh;">
        <h1 style="font-size:3rem; margin-bottom:20px;">{h1}</h1>
        <div class="content-body" style="font-size:1.2rem; line-height:1.6;">
            {content_html}
        </div>
    </main>
    """
    
    full_html = page_head + main_content + footer_html
    
    os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(full_html)


create_page('ai-film-studio-marrakech.html', 'AI Film Studio Marrakech', 'BYMOU is an AI Film Studio in Marrakech, Morocco producing cutting-edge AI-assisted film campaigns for luxury brands.', 'AI Film Studio Marrakech', '<p>BYMOU is a premier AI film studio based in Marrakech, Morocco. We specialize in producing highly cinematic, AI-assisted film campaigns tailored for luxury brands worldwide.</p><h2>Capabilities</h2><ul><li>AI Commercial Production</li><li>AI Fashion Campaigns</li><li>Concept Generation and Storyboarding</li></ul><p>Our work combines human creative direction with advanced generative AI to create visually stunning worlds that stop the scroll.</p>', '{"@context": "https://schema.org", "@type": "Service", "name": "AI Film Studio Marrakech", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "areaServed": "Marrakech, Morocco"}')
create_page('real-estate-creative-studio-marrakech.html', 'Real Estate Creative Studio Marrakech', 'BYMOU is a real estate creative studio in Marrakech providing architectural visualization and marketing campaigns.', 'Real Estate Creative Studio in Marrakech', '<p>BYMOU provides high-end real estate marketing visuals, films, and digital campaign assets for luxury properties and developments in Marrakech, Morocco.</p><h2>Services</h2><ul><li>Architectural Visualization</li><li>Property Branding</li><li>Digital Experience and Website Design for Real Estate</li></ul>')
create_page('hospitality-creative-studio.html', 'Hospitality Creative Studio', 'Creative branding and digital marketing for boutique hotels, restaurants, and premium guest experiences.', 'Hospitality Creative Studio', '<p>We craft cinematic hospitality marketing for hotels, restaurants, destinations, and premium guest experiences. BYMOU brings locations to life through sophisticated branding and digital storytelling.</p>')
create_page('luxury-branding-studio.html', 'Luxury Branding Studio', 'BYMOU creates luxury brand systems for premium visual identities and campaign worlds.', 'Luxury Branding Studio', '<p>BYMOU provides creative direction and luxury brand systems for premium visual identities. Our studio in Marrakech helps brands establish a powerful, timeless aesthetic.</p>')
create_page('architectural-visualization.html', 'Architectural Visualization', 'AI-powered architectural visualization for luxury real estate and hospitality.', 'Architectural Visualization', '<p>Transform blueprints into photorealistic worlds. BYMOU uses advanced AI tools to create stunning architectural visualizations that help buyers and investors experience spaces before they exist.</p>')
create_page('website-design-hospitality-real-estate.html', 'Website Design for Hospitality & Real Estate', 'Immersive website design for real estate and hospitality brands by BYMOU.', 'Website Design for Hospitality & Real Estate', '<p>Digital experiences designed to convert. We build immersive, high-performance websites specifically tailored for luxury real estate developments and boutique hospitality brands.</p>')
create_page('startup-rebranding.html', 'Startup Rebranding', 'Strategic rebranding and website design for ambitious startups.', 'Startup Rebranding', '<p>From concept to execution, BYMOU partners with startups to redefine their visual identity, messaging, and digital presence, preparing them for the next stage of growth.</p>')
create_page('ai-automation-morocco.html', 'AI Automation Morocco', 'AI automation solutions for businesses in Morocco by BYMOU.', 'AI Automation for Moroccan Businesses', '<p>Beyond visual creation, BYMOU assists businesses in Morocco with implementing intelligent AI automation solutions to streamline operations, marketing, and creative workflows.</p>')

create_page('insights/ai-film-campaigns-luxury-brands.html', 'AI Film Campaigns for Luxury Brands', 'How AI is transforming luxury brand campaigns and commercial production.', 'AI Film Campaigns for Luxury Brands', '<p>The landscape of luxury advertising is evolving. At BYMOU, we leverage AI to push the boundaries of commercial production.</p><p>By blending traditional creative direction with generative tools, we create highly polished, surreal, and captivating campaigns that resonate with high-end audiences.</p>', '{"@context": "https://schema.org", "@type": "Article", "headline": "AI Film Campaigns for Luxury Brands", "author": {"@type": "Organization", "name": "BYMOU"}}')
create_page('insights/ai-real-estate-marketing-marrakech.html', 'AI-Assisted Real Estate Marketing in Marrakech', 'Using AI for architectural visualization and real estate marketing in Morocco.', 'AI-Assisted Real Estate Marketing in Marrakech', '<p>Marrakech is home to some of the most stunning luxury properties in the world. Marketing these properties requires visuals that match their prestige.</p><p>At BYMOU, we use AI-assisted tools for architectural visualization, allowing developers to showcase properties with unprecedented realism and emotional appeal.</p>')

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(index_html.replace(footer_match.group(1), footer_html))

print("Pages built successfully.")
