import os
import glob

replacements = {
    "at the forefront of this shift": "actively working within this shift",
    "at the forefront": "actively engaged",
    "exponentially increase output speed": "improve output speed and efficiency",
    "exponentially increase": "meaningfully increase",
    "unparalleled flexibility": "substantial flexibility",
    "setting new benchmarks for digital luxury marketing": "creating impactful digital luxury marketing",
    "setting new benchmarks": "providing strong results",
    "the deciding factor in closing high-value transactions": "a highly influential component in engaging high-value prospects",
    "the deciding factor": "a key factor",
    "like Midjourney, Stable Diffusion, and LLMs": "such as advanced image synthesis models and large language models",
    '"@type": "LocalBusiness"': '"@type": "ProfessionalService"',
    "unprecedented realism": "high realism",
    "unprecedented levels of photorealism": "advanced levels of photorealism",
    "perfectly reflects": "effectively reflects",
    "perfectly captures": "accurately captures",
    "impossible or prohibitively expensive": "highly complex or prohibitively expensive",
    "bypasses the logistical constraints": "reduces the logistical constraints",
    "bypassing the logistical constraints": "reducing the logistical constraints"
}

files = glob.glob('*.html') + glob.glob('insights/*.html')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
            
print("Final factual claims pass complete.")
