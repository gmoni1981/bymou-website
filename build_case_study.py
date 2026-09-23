import os
import re

INDEX_PATH = 'index.html'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

index_html = read_file(INDEX_PATH)

# Extract head and footer
head_match = re.search(r'(<!DOCTYPE html>.*?<header class="frame">.*?</header>)', index_html, re.DOTALL)
footer_match = re.search(r'(<footer id="contact".*?</html>)', index_html, re.DOTALL)

head_html = head_match.group(1) if head_match else ""
footer_html = footer_match.group(1) if footer_match else ""

# Setup Case Study Schema and Head Meta
schema_json = """{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Case Study: AI-Assisted Concept Design for Luxury Villa Marketing",
  "about": {
    "@type": "Service",
    "name": "Architectural Visualization",
    "provider": {
      "@type": "ProfessionalService",
      "name": "BYMOU",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Marrakech",
        "addressCountry": "MA"
      }
    }
  },
  "author": {
    "@type": "Organization",
    "name": "BYMOU"
  },
  "keywords": "AI real estate marketing Marrakech, architectural visualization Marrakech, cinematic property marketing, luxury real estate creative studio"
}"""

title = "Case Study: AI Real Estate Marketing in Marrakech"
description = "A speculative case study demonstrating BYMOU's approach to marketing unbuilt luxury properties in Marrakech using AI architectural visualization and cinematic storytelling."
slug = "case-studies/ai-real-estate-marketing-marrakech.html"

# Update Head
page_head = head_html.replace(
    '<title>BYMOU — AI Creative Studio for Luxury Branding & Films</title>',
    f'<title>{title} | BYMOU</title>'
)
page_head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{description}">', page_head)
page_head = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="https://bymou.space/{slug}">', page_head)

# Inject schema
if 'application/ld+json' in page_head:
    page_head = re.sub(r'<script type="application/ld\+json">.*?</script>', f'<script type="application/ld+json">\\n{schema_json}\\n</script>', page_head, flags=re.DOTALL)
else:
    page_head = page_head.replace('</head>', f'<script type="application/ld+json">\\n{schema_json}\\n</script>\\n</head>')

# HTML Content Body
content_html = """
<div style="font-size:1.2rem; line-height:1.6; max-width:800px; padding-bottom:40px;">
    
    <p><strong>Location:</strong> Marrakech, Morocco<br>
    <strong>Project Type:</strong> Speculative Concept / Visual Study<br>
    <strong>Focus:</strong> AI-Assisted Cinematic Property Marketing & Architectural Visualization</p>

    <p>As a luxury real estate creative studio based in Marrakech, BYMOU regularly explores the boundaries of digital space creation. This speculative case study demonstrates our approach to marketing unbuilt luxury properties using advanced AI architectural visualization and cinematic storytelling. The goal was to conceptualize a modern Moroccan villa—blending traditional Tadelakt textures with brutalist, minimalist architecture—and package it as a highly aspirational campaign ready for high-net-worth investors.</p>

    <h2 style="margin-top:40px; font-size:2rem; border-bottom:1px solid #333; padding-bottom:10px;">The Business & Marketing Challenge</h2>
    <p>Luxury property developers in Marrakech face a distinct challenge when selling off-plan: static 3D renders often feel lifeless and fail to convey the atmosphere, climate, and luxury lifestyle of the location. Traditional architectural visualization can be slow to iterate and lacks the emotional resonance needed for premium sales. The challenge was to create a workflow that produces highly atmospheric, photorealistic marketing assets faster, while maintaining the prestige required for luxury real estate marketing in Marrakech.</p>

    <h2 style="margin-top:40px; font-size:2rem; border-bottom:1px solid #333; padding-bottom:10px;">Creative Direction</h2>
    <p>Our direction centered on "Atmospheric Serenity." Instead of focusing purely on structural dimensions, we aimed to capture the feeling of the space—the way the golden hour light in Marrakech strikes textured walls, the movement of shadow through a minimalist courtyard, and the seamless transition between indoor and outdoor living. The visual tone was set to be warm, cinematic, and deeply grounded in Moroccan aesthetics.</p>

    <h2 style="margin-top:40px; font-size:2rem; border-bottom:1px solid #333; padding-bottom:10px;">The AI-Assisted Workflow</h2>
    <p>To reduce the logistical constraints of traditional 3D modeling, we deployed a hybrid AI-assisted workflow.</p>
    <ul>
        <li style="margin-bottom:10px;"><strong>Structural Baselining:</strong> Basic geometric blocking was used to define the spatial layout of the villa.</li>
        <li style="margin-bottom:10px;"><strong>Generative Texturing & Lighting:</strong> We utilized advanced image synthesis models to dynamically apply lighting scenarios, material textures (such as raw concrete, terracotta, and olive wood), and environmental context.</li>
        <li style="margin-bottom:10px;"><strong>Rapid Iteration:</strong> This AI workflow allowed us to generate dozens of lighting and staging variations in hours rather than weeks, providing substantial flexibility during the art direction phase.</li>
    </ul>

    <h2 style="margin-top:40px; font-size:2rem; border-bottom:1px solid #333; padding-bottom:10px;">Architectural Visualization Approach</h2>
    <p>Our architectural visualization in Marrakech focuses on high realism. By guiding generative AI models with specific architectural prompts and physical lighting parameters, we achieved images that look like editorial photography rather than software outputs. We prioritized the interplay of natural light, local flora (olive trees and agave), and water reflections to create an immersive sense of place.</p>

    <h2 style="margin-top:40px; font-size:2rem; border-bottom:1px solid #333; padding-bottom:10px;">Film & Campaign Deliverables</h2>
    <p>The final output for this concept included a suite of assets designed for cross-platform cinematic property marketing:</p>
    <ul>
        <li style="margin-bottom:10px;"><strong>Hero Imagery:</strong> High-resolution, photorealistic exterior and interior "photographs" of the unbuilt space.</li>
        <li style="margin-bottom:10px;"><strong>Atmospheric Motion Studies:</strong> Short, slow-panning video assets that capture subtle movements (e.g., light shifting across a wall, water rippling in the courtyard pool).</li>
        <li style="margin-bottom:10px;"><strong>Digital Campaign Layouts:</strong> Mockups of how these assets integrate into a high-end property website and Instagram editorial feed.</li>
    </ul>

    <h2 style="margin-top:40px; font-size:2rem; border-bottom:1px solid #333; padding-bottom:10px;">Process Visuals (Before & After)</h2>
    <div style="background:#111; padding:20px; border-radius:8px; margin:20px 0;">
        <p style="color:#aaa; font-style:italic;">[Image Placeholder: Raw architectural blocking and spatial layout side-by-side with the color-graded, photorealistic final asset showcasing dynamic lighting and material generation]</p>
    </div>

    <h2 style="margin-top:40px; font-size:2rem; border-bottom:1px solid #333; padding-bottom:10px;">Final Outcome</h2>
    <p>The resulting concept proves that AI-assisted visualization is a highly influential component in engaging high-value prospects. The deliverables demonstrate an aesthetic quality that rivals high-end editorial photography, executed with a speed and efficiency that traditional workflows cannot match. For developers, this means the ability to launch premium marketing campaigns much earlier in the development cycle.</p>

    <h2 style="margin-top:40px; font-size:2rem; border-bottom:1px solid #333; padding-bottom:10px;">Services Provided</h2>
    <ul>
        <li>AI Real Estate Marketing</li>
        <li>Architectural Visualization</li>
        <li>Cinematic Property Marketing</li>
        <li>Creative Direction</li>
        <li>Digital Campaign Design</li>
    </ul>
</div>
"""

main_content = f"""
<main style="padding: 120px 5% 50px; max-width:1200px; margin:0 auto; color: white; background: black; min-height: 100vh;">
    <h1 style="font-size:3rem; margin-bottom:20px; max-width: 900px; line-height:1.2;">Case Study: AI-Assisted Concept Design for Luxury Villa Marketing</h1>
    {content_html}
</main>
"""

full_html = page_head + main_content + footer_html
write_file(slug, full_html)
print(f"Created {slug}")

# Add to sitemap
sitemap_path = 'sitemap.xml'
sitemap_content = read_file(sitemap_path)
new_sitemap_entry = f"""
  <url>
    <loc>https://bymou.space/{slug}</loc>
    <lastmod>2026-09-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>"""
sitemap_content = sitemap_content.replace('</urlset>', new_sitemap_entry)
write_file(sitemap_path, sitemap_content)
print("Updated sitemap.xml")

# Add link to index footer
new_footer_link = '<a href="/case-studies/ai-real-estate-marketing-marrakech.html">Case Study: AI Real Estate</a>'
index_html = index_html.replace('</nav>', new_footer_link + '\\n          </nav>')
write_file(INDEX_PATH, index_html)
print("Updated index.html footer")

