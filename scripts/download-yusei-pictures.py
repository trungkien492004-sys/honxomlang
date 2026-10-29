import os
import urllib.request
import json
from PIL import Image

cards = [
    ('AN-junk_synchron', 'Junk Synchron'),
    ('AN-speed_warrior', 'Speed Warrior'),
    ('AN-quillbolt_hedgehog', 'Quillbolt Hedgehog'),
    ('AN-sonic_chick', 'Sonic Chick'),
    ('AN-shield_wing', 'Shield Wing'),
    ('AN-junk_forward', 'Junk Forward'),
    ('AN-doppelwarrior', 'Doppelwarrior'),
    ('AN-effect_veiler', 'Effect Veiler'),
    ('AN-turbo_synchron', 'Turbo Synchron'),
    ('AN-nitro_synchron', 'Nitro Synchron'),
    ('AN-stardust_dragon', 'Stardust Dragon'),
    ('AN-junk_warrior', 'Junk Warrior'),
    ('AN-formula_synchron', 'Formula Synchron'),
    ('AN-armory_arm', 'Armory Arm'),
    ('AN-nitro_warrior', 'Nitro Warrior'),
    ('AN-scrap_iron_scarecrow', 'Scrap-Iron Scarecrow'),
    ('AN-tuning', 'Tuning'),
    ('AN-synchro_blast_wave', 'Synchro Blast Wave'),
    ('AN-limiter_overload', 'Limiter Overload'),
    ('AN-spirit_force', 'Spirit Force')
]

pics_dir = 'assets/memecard/pictures'
thumbs_dir = 'assets/memecard/pictures/thumbs'
os.makedirs(pics_dir, exist_ok=True)
os.makedirs(thumbs_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}

for cid, name in cards:
    out_webp = os.path.join(pics_dir, f"{cid}.webp")
    out_thumb = os.path.join(thumbs_dir, f"{cid}.webp")
    
    if os.path.exists(out_webp) and os.path.exists(out_thumb):
        print(f"Already exists: {cid}")
        continue
        
    url = f"https://db.ygoprodeck.com/api/v7/cardinfo.php?name={urllib.parse.quote(name)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            img_url = data['data'][0]['card_images'][0]['image_url_cropped']
            
            # download image
            tmp_jpg = f"scratch/{cid}.jpg"
            img_req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(img_req) as img_resp:
                with open(tmp_jpg, 'wb') as f:
                    f.write(img_resp.read())
            
            # convert to webp
            im = Image.open(tmp_jpg).convert('RGB')
            im.save(out_webp, 'WEBP', quality=85)
            
            # thumb
            thumb = im.copy()
            thumb.thumbnail((120, 120))
            thumb.save(out_thumb, 'WEBP', quality=80)
            
            if os.path.exists(tmp_jpg):
                os.remove(tmp_jpg)
            print(f"Downloaded & saved: {cid} ({name})")
    except Exception as e:
        print(f"Error {name}: {e}")

print("Done downloading Yusei pictures!")
