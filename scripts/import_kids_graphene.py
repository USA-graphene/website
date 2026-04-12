import os
import sys
import json
import uuid
import datetime
import urllib.request
import urllib.parse
import mimetypes

# Load environment variables
env_file = ".env.local"
if not os.path.exists(env_file):
    print("Error: .env.local not found!")
    sys.exit(1)

with open(env_file, 'r') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' in line:
            key, val = line.split('=', 1)
            os.environ[key.strip()] = val.strip()

project_id = os.environ.get('NEXT_PUBLIC_SANITY_PROJECT_ID', 't9t7is4j')
dataset = os.environ.get('NEXT_PUBLIC_SANITY_DATASET', 'production')
api_version = os.environ.get('NEXT_PUBLIC_SANITY_API_VERSION', 'v2023-05-03')
if not api_version.startswith('v'):
    api_version = 'v' + api_version
token = os.environ.get('SANITY_API_TOKEN')

if not token:
    print("Error: SANITY_API_TOKEN is missing!")
    sys.exit(1)

def generate_key():
    return str(uuid.uuid4()).replace('-', '')[:16]

post_data = {
    "title": "Making Magic with Pencil Lead! (A Graphene-Inspired Experiment for Kids)",
    "slug": "graphene-fun-kids-pencil-circuit",
    "excerpt": "Have you ever heard of a superhero material called graphene? Learn how you can make a super-fun conductive circuit right at your desk using your pencil!",
    "bodyText": """Hey young scientists and curious minds! 👋 Have you ever heard of a superhero material called graphene? It's like the coolest, thinnest, and strongest material ever, made from just one single layer of carbon atoms. Think of it like a super-flat sheet of chicken wire, but so tiny you can't even see it! 

While making pure graphene in a school lab is tricky, we can do a super fun experiment that uses its close cousin: graphite! You know, that dark stuff inside your pencil! Graphite is actually just stacked layers of graphene. And guess what? It conducts electricity! 

Let's build a real, working electrical circuit using nothing but a pencil.

### What You Will Need:
- A very soft, dark pencil (like a 4B, 6B, or an artist's sketching pencil)
- A piece of plain white printer paper
- A small 9-volt battery
- A small LED light bulb (like the ones from a science kit)
- Two wire leads with alligator clips (or just regular wire and some tape)

### The Experiment Steps:
1. **Draw the Circuit Path:** Take your soft pencil and draw a really thick, dark, and heavy shape on your paper. You want to make a thick path that has a gap in the middle, looking sort of like a horseshoe or the letter C. Make sure the graphite shines when you hold it up to the light—the thicker the layer, the better!
2. **Connect the Lightbulb:** Take your tiny LED bulb and bend its two metal legs out slightly to easily sit on the gap of your pencil drawing. Tape each leg securely to the two ends of your "horseshoe." One leg on one side, and one leg on the other. Make sure the metal directly touches the dark pencil mark!
3. **Power it Up!:** Using your alligator clips or tape, connect one wire to the positive end of your battery, and the other wire to the negative end. 
4. **Complete the Circuit:** Touch the other ends of those wires to opposite sides of your pencil drawing, along the thick graphite lines.

*Boom!* If you drew the lines thick enough, you should see the LED light bulb flicker or light up! If it doesn't work right away, try drawing over your lines again to make them thicker, or flip the battery wires (LEDs only let electricity flow in one direction).

### How Does it Work?!
The graphite from your pencil is made out of carbon, just like graphene. When you draw really hard on paper, you're leaving behind millions of tiny, overlapping flakes of graphene. Because of the special way the carbon atoms are arranged, they allow tiny particles called electrons to jump from one flake to the next.

When you connected the battery to the paper, you sent a stream of electrons zooming right through those graphite flakes you drew! They traveled through the dark pencil marking, jumped up the metal leg of the LED to light it up, and raced back through the other pencil line to the battery, completing the circuit! 

By playing with pencil lead today, you just worked with the exact same science that engineers are using to build the next generation of super-fast computers, batteries, and flexible phone screens! Keep exploring!""",
    "localImagePath": "/Users/raimis/.gemini/antigravity/brain/c127631b-ab61-4ac3-b8ea-9bfb3d645822/kids_graphene_experiment_1775704128089.png"
}

def upload_image(filepath):
    print("Uploading image...")
    filename = os.path.basename(filepath)
    content_type, _ = mimetypes.guess_type(filepath)
    if not content_type:
        content_type = 'image/png'

    url = f"https://{project_id}.api.sanity.io/{api_version}/assets/images/{dataset}?filename={filename}"
    
    with open(filepath, 'rb') as f:
        data = f.read()

    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', content_type)

    try:
        response = urllib.request.urlopen(req)
        resp_data = json.loads(response.read().decode('utf-8'))
        print("Image uploaded successfully!")
        return resp_data['document']['_id']
    except Exception as e:
        print(f"Failed to upload image: {e}")
        return None

def create_post(image_id):
    print("Creating post document...")

    blocks = []
    for paragraph in post_data["bodyText"].split('\n\n'):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        
        style = 'normal'
        text = paragraph
        if paragraph.startswith('### '):
            style = 'h3'
            text = paragraph.replace('### ', '').strip()

        blocks.append({
            "_type": "block",
            "_key": generate_key(),
            "style": style,
            "children": [{
                "_type": "span",
                "_key": generate_key(),
                "text": text,
                "marks": []
            }],
            "markDefs": []
        })

    doc = {
        "_id": post_data["slug"],
        "_type": "post",
        "title": post_data["title"],
        "slug": { "_type": "slug", "current": post_data["slug"] },
        "publishedAt": datetime.datetime.utcnow().isoformat() + "Z",
        "excerpt": post_data["excerpt"],
        "body": blocks
    }

    if image_id:
        doc["mainImage"] = {
            "_type": "image",
            "asset": {
                "_type": "reference",
                "_ref": image_id
            }
        }

    mutations = {
        "mutations": [
            { "createOrReplace": doc }
        ]
    }

    url = f"https://{project_id}.api.sanity.io/{api_version}/data/mutate/{dataset}"
    data = json.dumps(mutations).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/json')

    try:
        response = urllib.request.urlopen(req)
        resp_data = json.loads(response.read().decode('utf-8'))
        print("Post created successfully!")
        print(json.dumps(resp_data, indent=2))
    except urllib.error.HTTPError as e:
        print(f"Failed to create post. HTTP Error {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Failed to create post: {e}")

if __name__ == "__main__":
    img_id = upload_image(post_data["localImagePath"])
    create_post(img_id)
