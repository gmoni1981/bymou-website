import os
import re

INDEX_PATH = 'index.html'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Use absolute paths for all links in the footer to avoid relative link issues
def fix_footer_links(html):
    # Replace relative links with absolute paths
    html = html.replace('href="ai-film-studio-marrakech.html"', 'href="/ai-film-studio-marrakech.html"')
    html = html.replace('href="real-estate-creative-studio-marrakech.html"', 'href="/real-estate-creative-studio-marrakech.html"')
    html = html.replace('href="hospitality-creative-studio.html"', 'href="/hospitality-creative-studio.html"')
    html = html.replace('href="luxury-branding-studio.html"', 'href="/luxury-branding-studio.html"')
    html = html.replace('href="architectural-visualization.html"', 'href="/architectural-visualization.html"')
    html = html.replace('href="website-design-hospitality-real-estate.html"', 'href="/website-design-hospitality-real-estate.html"')
    html = html.replace('href="startup-rebranding.html"', 'href="/startup-rebranding.html"')
    html = html.replace('href="ai-automation-morocco.html"', 'href="/ai-automation-morocco.html"')
    html = html.replace('href="insights/ai-film-campaigns-luxury-brands.html"', 'href="/insights/ai-film-campaigns-luxury-brands.html"')
    html = html.replace('href="insights/ai-real-estate-marketing-marrakech.html"', 'href="/insights/ai-real-estate-marketing-marrakech.html"')
    return html

def fix_canonical(html, slug):
    # Replace canonical url
    return re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="https://bymou.space/{slug}">', html)

# The base HTML uses <main> wrapped content
def rewrite_page(filepath, slug, expanded_content, schema):
    html = read_file(filepath)
    html = fix_footer_links(html)
    html = fix_canonical(html, slug)
    
    # Replace main content
    html = re.sub(r'<div class="content-body".*?>.*?</div>', f'<div class="content-body" style="font-size:1.2rem; line-height:1.6; max-width:800px;">{expanded_content}</div>', html, flags=re.DOTALL)
    
    # Ensure schema is there, if not add it
    if 'application/ld+json' not in html and schema:
        html = html.replace('</head>', f'<script type="application/ld+json">\\n{schema}\\n</script>\\n</head>')
    elif schema:
        # Replace existing schema
        html = re.sub(r'<script type="application/ld\+json">.*?</script>', f'<script type="application/ld+json">\\n{schema}\\n</script>', html, flags=re.DOTALL)
        
    write_file(filepath, html)


# Expand content for AI Film Studio
ai_film_content = """
<p>At BYMOU, our AI Film Studio in Marrakech represents the convergence of high-end cinematic production and generative AI technology. We cater exclusively to luxury brands, offering an innovative approach to commercial campaigns that bypasses the logistical constraints of traditional film shoots.</p>
<h3>Our Approach to AI Film</h3>
<p>We do not simply generate images; we direct them. Our process starts with rigorous storyboarding, mood boarding, and creative direction. We then utilize advanced diffusion models and AI video synthesis to craft scenes that are visually striking, emotionally resonant, and aligned with your brand's heritage.</p>
<h3>Service Offerings</h3>
<ul>
    <li><strong>AI Commercial Production:</strong> Full-scale digital commercials with photorealistic environments, dynamic lighting, and seamless motion.</li>
    <li><strong>Fashion Campaigns:</strong> Editorial-quality video assets that showcase apparel and accessories in impossible or highly stylized worlds.</li>
    <li><strong>Concept Visualization:</strong> Pre-visualization for large-scale campaigns, allowing directors and stakeholders to see the final look before committing to a physical shoot.</li>
</ul>
<p>By blending our deep understanding of luxury aesthetics with cutting-edge AI tools, we deliver campaigns that command attention and elevate brand perception.</p>
"""
schema_ai_film = '{"@context": "https://schema.org", "@type": "Service", "name": "AI Film Studio Marrakech", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "areaServed": "Marrakech, Morocco", "description": "AI-assisted cinematic film production and luxury commercial campaigns."}'

rewrite_page('ai-film-studio-marrakech.html', 'ai-film-studio-marrakech.html', ai_film_content, schema_ai_film)

# Expand real estate
re_content = """
<p>Marketing luxury real estate requires more than just floor plans and static renderings; it requires creating a compelling vision of a lifestyle. BYMOU operates as a specialized creative studio for real estate developers and agencies in Marrakech, transforming unbuilt properties into highly desirable visual experiences.</p>
<h3>Architectural Visualization & Marketing</h3>
<p>Our team leverages AI-assisted 3D rendering and cinematic motion design to produce marketing assets that sell properties faster and at higher valuations.</p>
<ul>
    <li><strong>Cinematic Property Tours:</strong> We create immersive, fly-through animations of luxury villas and resorts, focusing on atmosphere, lighting, and the unique character of Moroccan architecture.</li>
    <li><strong>Digital Experience Design:</strong> Custom, high-performance websites for specific property developments, featuring interactive master plans, localized storytelling, and lead-generation tools.</li>
    <li><strong>Property Branding:</strong> Comprehensive identity systems for new developments, including naming, logo design, and brand guidelines that resonate with international investors.</li>
</ul>
<p>Our deep roots in Marrakech give us a unique perspective on the intersection of modern luxury and traditional Moroccan aesthetics, making our real estate campaigns highly effective for both local and global markets.</p>
"""
schema_re = '{"@context": "https://schema.org", "@type": "Service", "name": "Real Estate Creative Studio", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "areaServed": "Marrakech, Morocco", "description": "Architectural visualization, branding, and marketing for luxury real estate developments."}'
rewrite_page('real-estate-creative-studio-marrakech.html', 'real-estate-creative-studio-marrakech.html', re_content, schema_re)

# Expand hospitality
hosp_content = """
<p>The hospitality sector in Marrakech is renowned worldwide, and standing out requires a digital presence that perfectly reflects the physical guest experience. BYMOU specializes in crafting the digital identity and marketing campaigns for boutique hotels, riads, and luxury resorts.</p>
<h3>Elevating the Guest Experience Before Arrival</h3>
<p>We believe a guest\'s experience begins the moment they discover your property online. Our creative studio builds that initial connection through highly curated visual storytelling and seamless digital touchpoints.</p>
<ul>
    <li><strong>Destination Branding:</strong> We develop visual identities that capture the soul of your property, from typography and color palettes to art direction.</li>
    <li><strong>Immersive Web Design:</strong> Our websites are designed to be visual journeys, utilizing high-quality video integration, elegant typography, and intuitive booking flows to maximize direct reservations.</li>
    <li><strong>Content Systems:</strong> We create sustainable, high-end social media content frameworks and advertising assets that continuously drive engagement and aspiration.</li>
</ul>
<p>Partnering with BYMOU ensures your hospitality brand communicates its unique value proposition with elegance and sophistication.</p>
"""
schema_hosp = '{"@context": "https://schema.org", "@type": "Service", "name": "Hospitality Creative Studio", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "areaServed": "Global", "description": "Branding, web design, and digital marketing for luxury hospitality brands."}'
rewrite_page('hospitality-creative-studio.html', 'hospitality-creative-studio.html', hosp_content, schema_hosp)

# Expand luxury branding
lux_content = """
<p>At the core of every iconic luxury brand is a distinct, uncompromising visual system. BYMOU acts as a strategic creative partner to premium brands, designing identities that command prestige and longevity.</p>
<h3>Crafting Timeless Identities</h3>
<p>Our approach to luxury branding goes beyond simple aesthetics; we build comprehensive universes. Whether launching a new fragrance, a high-end fashion line, or a boutique lifestyle product, we ensure every touchpoint exudes exclusivity and quality.</p>
<ul>
    <li><strong>Brand Strategy & Positioning:</strong> Defining the narrative, target audience, and unique market position of your brand.</li>
    <li><strong>Visual Identity Systems:</strong> Logo design, typography curation, color theory, and comprehensive brand guidelines.</li>
    <li><strong>Art Direction & Campaign Concepts:</strong> Directing the visual style for photography, film, and AI-generated assets to ensure a cohesive brand narrative across all media.</li>
</ul>
<p>We help brands transition from being merely visible to becoming highly desired.</p>
"""
schema_lux = '{"@context": "https://schema.org", "@type": "Service", "name": "Luxury Branding Studio", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "description": "Strategic branding and visual identity systems for premium brands."}'
rewrite_page('luxury-branding-studio.html', 'luxury-branding-studio.html', lux_content, schema_lux)

# Expand arch viz
arch_content = """
<p>Architectural visualization has evolved. Traditional 3D rendering can be slow and rigid. BYMOU utilizes AI-powered workflows to revolutionize how architects, developers, and designers present unbuilt spaces.</p>
<h3>Photorealistic Visualization at Speed</h3>
<p>By integrating generative AI with traditional 3D modeling, we dramatically accelerate the visualization process while achieving unprecedented levels of photorealism and atmospheric depth.</p>
<ul>
    <li><strong>Interior & Exterior Rendering:</strong> High-resolution imagery that perfectly captures lighting, materials, and spatial dynamics.</li>
    <li><strong>Atmospheric Styling:</strong> The ability to rapidly iterate through different lighting scenarios (dawn, dusk, night) and interior design styles without rebuilding 3D scenes from scratch.</li>
    <li><strong>Concept Exploration:</strong> Assisting architects during the ideation phase by quickly visualizing structural concepts and material combinations.</li>
</ul>
<p>Our visualizations don't just show what a building looks like; they convey how it feels to be inside it.</p>
"""
schema_arch = '{"@context": "https://schema.org", "@type": "Service", "name": "Architectural Visualization", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "description": "AI-powered photorealistic architectural visualization."}'
rewrite_page('architectural-visualization.html', 'architectural-visualization.html', arch_content, schema_arch)

# Expand web design
web_content = """
<p>Your website is often the first and most critical interaction a client has with your brand. For luxury real estate and hospitality, a templated website is a missed opportunity. BYMOU designs bespoke, immersive web experiences that captivate and convert.</p>
<h3>Digital Experiences Designed to Convert</h3>
<p>We combine cutting-edge web technologies (like WebGL and GSAP animations) with refined design sensibilities to create websites that feel less like brochures and more like interactive films.</p>
<ul>
    <li><strong>Boutique Hotel Websites:</strong> Platforms designed to showcase the property through stunning visuals while ensuring a frictionless booking experience.</li>
    <li><strong>Real Estate Development Portals:</strong> Interactive sites featuring dynamic master plans, property availability filtering, and secure investor portals.</li>
    <li><strong>Performance & Optimization:</strong> While our sites are visually rich, we ensure they are heavily optimized for speed, mobile responsiveness, and technical SEO to maximize organic discoverability.</li>
</ul>
<p>We build digital flagships that accurately reflect the quality of your physical properties.</p>
"""
schema_web = '{"@context": "https://schema.org", "@type": "Service", "name": "Website Design for Hospitality & Real Estate", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "description": "Bespoke, immersive website design for luxury properties."}'
rewrite_page('website-design-hospitality-real-estate.html', 'website-design-hospitality-real-estate.html', web_content, schema_web)

# Expand startup rebranding
startup_content = """
<p>As startups mature from early-stage ventures into market leaders, their initial branding often becomes a liability. BYMOU partners with ambitious startups to execute strategic rebrands that reflect their growth and future trajectory.</p>
<h3>Strategic Rebranding for the Next Stage of Growth</h3>
<p>A successful rebrand is more than a new logo; it's a realignment of your company's visual communication with its current market position and product offering.</p>
<ul>
    <li><strong>Brand Audits & Strategy:</strong> We analyze your current brand equity, market positioning, and competitor landscape to identify opportunities for differentiation.</li>
    <li><strong>Comprehensive Visual Overhaul:</strong> Designing modern, scalable identity systems that work across digital products, marketing materials, and corporate communications.</li>
    <li><strong>Website Redesign:</strong> Rebuilding your marketing site to communicate your evolved value proposition clearly, effectively, and beautifully, ensuring it serves as a powerful engine for growth.</li>
</ul>
<p>We provide startups with the visual authority required to win enterprise clients, attract top-tier talent, and secure later-stage funding.</p>
"""
schema_startup = '{"@context": "https://schema.org", "@type": "Service", "name": "Startup Rebranding", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "description": "Strategic rebranding and web design for maturing startups."}'
rewrite_page('startup-rebranding.html', 'startup-rebranding.html', startup_content, schema_startup)

# Expand AI automation
ai_auto_content = """
<p>Beyond creative output, BYMOU assists forward-thinking businesses in Morocco and globally in integrating AI automation into their daily operations. We help demystify AI, turning it from a buzzword into a tangible competitive advantage.</p>
<h3>Intelligent Workflows for Modern Businesses</h3>
<p>We consult on and implement AI solutions designed to streamline repetitive tasks, enhance creative workflows, and improve marketing efficiency.</p>
<ul>
    <li><strong>Creative Workflow Automation:</strong> Implementing generative AI tools (like Midjourney, Stable Diffusion, and LLMs) into your internal creative processes to exponentially increase output speed.</li>
    <li><strong>Marketing Automation:</strong> Setting up AI-driven systems for content generation, personalized email marketing, and customer segmentation.</li>
    <li><strong>Custom AI Solutions:</strong> Advising on the deployment of bespoke AI agents and chatbots to handle customer inquiries, internal knowledge retrieval, and data analysis.</li>
</ul>
<p>By automating the mundane, we empower your team to focus on strategic, high-value initiatives.</p>
"""
schema_ai_auto = '{"@context": "https://schema.org", "@type": "Service", "name": "AI Automation Morocco", "provider": {"@type": "LocalBusiness", "name": "BYMOU"}, "areaServed": "Morocco", "description": "AI consulting and automation solutions for business workflows."}'
rewrite_page('ai-automation-morocco.html', 'ai-automation-morocco.html', ai_auto_content, schema_ai_auto)

# Expand insights
insight_film_content = """
<p>The landscape of luxury advertising is undergoing a profound transformation. At BYMOU, we are at the forefront of this shift, leveraging generative AI to push the boundaries of commercial production and storytelling.</p>
<h3>The Shift from Physical to Computational</h3>
<p>Historically, luxury film campaigns required massive logistical efforts: flying crews to remote locations, building elaborate sets, and managing unpredictable elements. Today, AI allows us to bypass these constraints. We can conceptualize and execute campaigns in surreal, hyper-realistic environments that would be impossible or prohibitively expensive to film in reality.</p>
<h3>Maintained Focus on Creative Direction</h3>
<p>However, AI is simply a tool; it is not a replacement for human taste and creative direction. The success of an AI-assisted campaign hinges entirely on the director's vision. We apply traditional cinematic principles—lighting, composition, pacing, and color grading—to AI-generated assets, ensuring the final output aligns perfectly with the brand's heritage and aesthetic standards.</p>
<p>By blending traditional artistry with computational power, BYMOU creates highly polished, captivating campaigns that resonate deeply with high-end audiences, setting new benchmarks for digital luxury marketing.</p>
"""
schema_insight_film = '{"@context": "https://schema.org", "@type": "Article", "headline": "AI Film Campaigns for Luxury Brands", "author": {"@type": "Organization", "name": "BYMOU"}, "publisher": {"@type": "Organization", "name": "BYMOU"}}'
rewrite_page('insights/ai-film-campaigns-luxury-brands.html', 'insights/ai-film-campaigns-luxury-brands.html', insight_film_content, schema_insight_film)

insight_re_content = """
<p>Marrakech is home to some of the most stunning luxury properties and architectural developments in the world. Marketing these prestige properties effectively requires visuals that match their exclusivity and allure.</p>
<h3>The Role of AI in Architectural Visualization</h3>
<p>Traditional 3D rendering has long been the standard for real estate marketing, but it can be a slow, iterative process. At BYMOU, we integrate AI-assisted tools into our architectural visualization workflows. This allows us to rapidly prototype different lighting scenarios, interior design styles, and atmospheric conditions, giving developers unparalleled flexibility in how they present unbuilt properties.</p>
<h3>Selling a Lifestyle, Not Just a Floor Plan</h3>
<p>Our focus extends beyond technical accuracy. We aim to evoke an emotional response. By utilizing cinematic motion and AI-enhanced imagery, we create immersive digital experiences that allow potential buyers to truly feel the space. Whether it's a sprawling villa in the Palmeraie or a boutique riad in the Medina, our campaigns are designed to highlight the unique intersection of modern luxury and traditional Moroccan craftsmanship.</p>
<p>In a competitive real estate market, compelling visual storytelling is not just an asset; it is the deciding factor in closing high-value transactions.</p>
"""
schema_insight_re = '{"@context": "https://schema.org", "@type": "Article", "headline": "AI-Assisted Real Estate Marketing in Marrakech", "author": {"@type": "Organization", "name": "BYMOU"}, "publisher": {"@type": "Organization", "name": "BYMOU"}}'
rewrite_page('insights/ai-real-estate-marketing-marrakech.html', 'insights/ai-real-estate-marketing-marrakech.html', insight_re_content, schema_insight_re)

# Also fix the index.html internal links
index_html = read_file(INDEX_PATH)
index_html = fix_footer_links(index_html)
write_file(INDEX_PATH, index_html)

print("Fixes applied.")
