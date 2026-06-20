import os
import sys
import time
import sqlite3
import shutil
import argparse
import cloudscraper
import re
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator

# Thiết lập encoding UTF-8 cho stdout trên Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://yugioh.fandom.com"
START_URL = "https://yugioh.fandom.com/wiki/Category:Anime_cards"
DB_FILE = "yugioh_anime.db"
BACKUP_DB_FILE = "yugioh_anime.db.bak"

# Tạo đối tượng cloudscraper để bypass Cloudflare
scraper = cloudscraper.create_scraper()

def get_translator():
    try:
        return GoogleTranslator(source='en', target='vi')
    except Exception as e:
        print(f"[-] Không khởi tạo được bộ dịch: {e}")
        return None

translator = get_translator()

def translate_text(text):
    if not text or not translator:
        return text
    for attempt in range(2):
        try:
            text_to_translate = text.strip()
            if not text_to_translate:
                return ""
            translated = translator.translate(text_to_translate)
            return translated
        except Exception as e:
            print(f"[!] Lỗi dịch (Lần thử {attempt+1}): {e}")
            time.sleep(1)
    return text

def setup_database():
    if os.path.exists(DB_FILE):
        print(f"[*] Đang tạo bản sao lưu an toàn cho database tại: {BACKUP_DB_FILE}")
        shutil.copy2(DB_FILE, BACKUP_DB_FILE)
        
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS anime_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_en TEXT UNIQUE NOT NULL,
        name_vi TEXT,
        card_type TEXT NOT NULL,
        attribute TEXT,
        monster_type TEXT,
        level_rank INTEGER,
        atk TEXT,
        def TEXT,
        property TEXT,
        anime_effect_en TEXT,
        anime_effect_vi TEXT,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    return conn

def export_to_js():
    try:
        import json
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name_en, name_vi, card_type, attribute, monster_type, level_rank, atk, def, property, anime_effect_en, anime_effect_vi, source_url FROM anime_cards")
        columns = [col[0] for col in cursor.description]
        cards = []
        for row in cursor.fetchall():
            cards.append(dict(zip(columns, row)))
        
        js_path = os.path.join("assets", "js", "yugioh_cards_data.js")
        os.makedirs(os.path.dirname(js_path), exist_ok=True)
        with open(js_path, "w", encoding="utf-8") as f:
            f.write("// ===== 🃏 YUGIOH CARDS DATABASE DATA =====\n")
            f.write("window.YUGIOH_CARDS = ")
            json.dump(cards, f, ensure_ascii=False, indent=2)
            f.write(";\n")
        print(f"    [+] Đã xuất {len(cards)} lá bài ra file {js_path}")
        conn.close()
    except Exception as e:
        print(f"    [-] Lỗi xuất dữ liệu ra JS: {e}")

def clean_name(name):
    name = name.strip()
    name = re.sub(r'\s*\((later\s+)?anime\)\s*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(card\)\s*$', '', name, flags=re.IGNORECASE)
    return name.strip()

def parse_card_page(html, url):
    soup = BeautifulSoup(html, 'html.parser')
    card = {
        'name_en': '',
        'name_vi': '',
        'card_type': '',
        'attribute': None,
        'monster_type': None,
        'level_rank': None,
        'atk': None,
        'def': None,
        'property': None,
        'anime_effect_en': '',
        'anime_effect_vi': '',
        'source_url': url
    }

    h1 = soup.find('h1', id='firstHeading')
    if h1:
        card['name_en'] = clean_name(h1.get_text())
    else:
        title = soup.find('title')
        if title:
            card['name_en'] = clean_name(title.get_text().split('|')[0])
            
    if not card['name_en']:
        return None

    found_details = False

    # 1. THỬ PARSE THEO DẠNG INNER TABLE (Lá bài Anime đặc thù)
    inner_table = soup.find('table', class_='innertable')
    if inner_table:
        found_details = True
        card_type_header = inner_table.find(string=lambda t: t and "Card type" in t)
        if card_type_header:
            card_type_tr = card_type_header.find_parent('tr')
            if card_type_tr:
                card_type_td = card_type_tr.find('td')
                if card_type_td:
                    card['card_type'] = card_type_td.get_text().strip()
                
        if not card['card_type']:
            if inner_table.find(string=lambda t: t and "Attribute" in t):
                card['card_type'] = 'Monster'
            elif inner_table.find(string=lambda t: t and "Property" in t):
                lore_types = inner_table.find('div', class_='card-table-types')
                if lore_types and "spell" in lore_types.get_text().lower():
                    card['card_type'] = 'Spell'
                elif lore_types and "trap" in lore_types.get_text().lower():
                    card['card_type'] = 'Trap'
                else:
                    card['card_type'] = 'Spell'

        attr_header = inner_table.find(string=lambda t: t and "Attribute" in t)
        if attr_header:
            attr_tr = attr_header.find_parent('tr')
            if attr_tr:
                attr_td = attr_tr.find('td')
                if attr_td:
                    card['attribute'] = attr_td.get_text().strip()

        lvl_header = inner_table.find(string=lambda t: t and ("Level" in t or "Rank" in t))
        if lvl_header:
            lvl_tr = lvl_header.find_parent('tr')
            if lvl_tr:
                lvl_td = lvl_tr.find('td')
                if lvl_td:
                    lvl_match = re.search(r'\d+', lvl_td.get_text())
                    if lvl_match:
                        card['level_rank'] = int(lvl_match.group(0))

        prop_header = inner_table.find(string=lambda t: t and "Property" in t)
        if prop_header:
            prop_tr = prop_header.find_parent('tr')
            if prop_tr:
                prop_td = prop_tr.find('td')
                if prop_td:
                    card['property'] = prop_td.get_text().strip()

        lore_box = inner_table.find('div', class_='lorebox')
        if lore_box:
            types_div = lore_box.find('div', class_='card-table-types')
            if types_div:
                card['monster_type'] = types_div.get_text().replace('[', '').replace(']', '').strip()
            
            lore_div = lore_box.find('div', class_='lorebox-lore')
            if lore_div:
                card['anime_effect_en'] = lore_div.get_text().strip()
                
            stats_div = lore_box.find('div', class_='lorebox-stats')
            if stats_div:
                stats_text = stats_div.get_text()
                atk_match = re.search(r'ATK\s*/\s*(\S+)', stats_text)
                def_match = re.search(r'DEF\s*/\s*(\S+)', stats_text)
                if atk_match:
                    card['atk'] = atk_match.group(1).strip()
                if def_match:
                    card['def'] = def_match.group(1).strip()

    # 2. THỬ PARSE THEO DẠNG CARDTABLE CHUẨN
    if not found_details:
        card_table = soup.find('table', class_='cardtable')
        if card_table:
            found_details = True
            
            def find_row_data(header_name):
                for row in card_table.find_all('tr'):
                    th = row.find('th')
                    if th and header_name.lower() in th.get_text().lower():
                        td = row.find('td')
                        if td:
                            return td.get_text().strip()
                return None

            card['card_type'] = find_row_data('Card type') or ''
            if not card['card_type']:
                if find_row_data('Attribute'):
                    card['card_type'] = 'Monster'
                elif find_row_data('Property'):
                    card['card_type'] = 'Spell' # Fallback
            
            if card['card_type'] == 'Monster' or find_row_data('Attribute'):
                card['card_type'] = 'Monster'
                card['attribute'] = find_row_data('Attribute')
                card['monster_type'] = find_row_data('Types')
                
                lvl_val = find_row_data('Level') or find_row_data('Rank')
                if lvl_val:
                    lvl_match = re.search(r'\d+', lvl_val)
                    if lvl_match:
                        card['level_rank'] = int(lvl_match.group(0))
                        
                atk_def_val = find_row_data('ATK / DEF')
                if atk_def_val:
                    parts = atk_def_val.split('/')
                    if len(parts) >= 2:
                        card['atk'] = parts[0].strip()
                        card['def'] = parts[1].strip()
            else:
                card['property'] = find_row_data('Property')

            desc_row = None
            for row in card_table.find_all('tr'):
                if "card descriptions" in str(row).lower():
                    desc_row = row
                    break
            
            if desc_row:
                eng_box = desc_row.find('th', string=re.compile(r'English', re.I))
                if eng_box:
                    eng_inner_table = eng_box.find_parent('table')
                    if eng_inner_table:
                        list_td = eng_inner_table.find('td', class_='navbox-list')
                        if list_td:
                            card['anime_effect_en'] = list_td.get_text().strip()

    if not card['anime_effect_en']:
        lore_div = soup.find('div', class_='lore')
        if lore_div:
            card['anime_effect_en'] = lore_div.get_text().strip()

    if card['anime_effect_en']:
        card['anime_effect_en'] = " ".join(card['anime_effect_en'].split())
        
    return card

def main():
    parser = argparse.ArgumentParser(description="Yu-Gi-Oh! Anime Card Scraper to SQLite")
    parser.add_argument('--limit', type=int, default=0, help="Giới hạn số lượng lá bài cần cào (0 là cào tất cả)")
    parser.add_argument('--delay', type=float, default=0.5, help="Độ trễ giữa các request (giây) để tránh bị chặn")
    args = parser.parse_args()

    print("[*] Đang khởi tạo cơ sở dữ liệu...")
    conn = setup_database()
    cursor = conn.cursor()

    current_url = START_URL
    cards_processed = 0
    cards_saved = 0
    limit = args.limit

    print("[*] Bắt đầu cào dữ liệu danh mục thẻ bài...")
    while current_url:
        print(f"\n[*] Đang tải trang danh mục: {current_url}")
        try:
            res = scraper.get(current_url, timeout=15)
            res.raise_for_status()
        except Exception as e:
            print(f"[-] Lỗi tải trang danh mục {current_url}: {e}")
            break

        soup = BeautifulSoup(res.text, 'html.parser')
        
        members = soup.find_all('li', class_='category-page__member')
        card_links = []
        for member in members:
            a_tag = member.find('a')
            if a_tag:
                href = a_tag.get('href', '')
                title = a_tag.get('title', '')
                if href and not href.startswith('Category:'):
                    card_links.append((BASE_URL + href, title))

        print(f"[+] Tìm thấy {len(card_links)} liên kết lá bài trên trang này.")

        for card_url, card_title in card_links:
            if limit > 0 and cards_processed >= limit:
                print(f"\n[+] Đã đạt giới hạn cào tối đa: {limit} lá bài.")
                current_url = None
                break

            cursor.execute("SELECT id FROM anime_cards WHERE source_url = ? OR name_en = ?", (card_url, clean_name(card_title)))
            if cursor.fetchone():
                print(f"[-] Bỏ qua lá bài đã tồn tại trong DB: {card_title}")
                cards_processed += 1
                continue

            print(f"\n[{cards_processed + 1}] Đang cào chi tiết: {card_title}")
            print(f"    Link: {card_url}")
            
            time.sleep(args.delay)

            try:
                card_res = scraper.get(card_url, timeout=15)
                card_res.raise_for_status()
                card_data = parse_card_page(card_res.text, card_url)
            except Exception as e:
                print(f"    [-] Lỗi tải/phân tích lá bài {card_title}: {e}")
                cards_processed += 1
                continue

            if not card_data or not card_data['name_en']:
                print(f"    [-] Không phân tích được thông số lá bài: {card_title}")
                cards_processed += 1
                continue

            print(f"    [*] Đang dịch tên: '{card_data['name_en']}'...")
            card_data['name_vi'] = translate_text(card_data['name_en'])
            
            if card_data['anime_effect_en']:
                print(f"    [*] Đang dịch hiệu ứng Anime ({len(card_data['anime_effect_en'])} ký tự)...")
                card_data['anime_effect_vi'] = translate_text(card_data['anime_effect_en'])
            else:
                card_data['anime_effect_vi'] = ""

            try:
                cursor.execute("""
                INSERT OR REPLACE INTO anime_cards (
                    name_en, name_vi, card_type, attribute, monster_type, 
                    level_rank, atk, def, property, anime_effect_en, anime_effect_vi, source_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    card_data['name_en'],
                    card_data['name_vi'],
                    card_data['card_type'],
                    card_data['attribute'],
                    card_data['monster_type'],
                    card_data['level_rank'],
                    card_data['atk'],
                    card_data['def'],
                    card_data['property'],
                    card_data['anime_effect_en'],
                    card_data['anime_effect_vi'],
                    card_data['source_url']
                ))
                conn.commit()
                cards_saved += 1
                if cards_saved % 20 == 0:
                    export_to_js()
                print(f"    [+] Đã lưu thành công: {card_data['name_vi']} ({card_data['name_en']})")
                print(f"        Loại: {card_data['card_type']} | ATK: {card_data['atk']} | DEF: {card_data['def']}")
            except Exception as e:
                print(f"    [-] Lỗi lưu vào DB cho lá bài {card_title}: {e}")

            cards_processed += 1

        if limit > 0 and cards_processed >= limit:
            break

        next_button = soup.find('a', class_='category-page__pagination-next')
        if next_button and next_button.get('href'):
            current_url = next_button.get('href')
            if not current_url.startswith('http'):
                current_url = BASE_URL + current_url
        else:
            print("[+] Đã tới trang cuối cùng của danh mục Anime Cards.")
            current_url = None

    conn.close()
    export_to_js()
    print(f"\n[+] QUÁ TRÌNH CÀO HOÀN TẤT!")
    print(f"    - Tổng số lá bài xử lý: {cards_processed}")
    print(f"    - Số lá bài lưu mới vào SQLite: {cards_saved}")

if __name__ == '__main__':
    main()
