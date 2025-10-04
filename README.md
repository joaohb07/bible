# 📖 Catholic Bible Project (MVP)

## ✨ Overview
This project aims to create a **minimalist and responsive website** for reading the Catholic Bible in **three public-domain translations**:

- **Latin** – *Vulgata Clementina*  
- **Portuguese** – *Pe. Matos Soares*  
- **English** – *Douay-Rheims*  

The site will be published as a **100% static project via GitHub Pages**, requiring no backend, prioritizing accessibility and simplicity.

---

## 🎯 MVP Goals
- Reading by chapter.  
- Switch between the three translations (PT / LA / EN) using the **language selector in the footer**.  
- Navigation through a **table of contents** (books → chapters).  
- Simple search within the current chapter.  
- Book animation: closed at first → opens into the table of contents.  
- Page-turn animation triggered by arrows (automatic animation, no “drag”).  
- Minimalist footer: **GitHub tag** (left) + **language selector with flags** (right).  

---

## 🗂️ Data Structure
Each chapter is stored as a separate **JSON file**, one per translation.

**Chapter schema:**
```json
{
  "translation": "matossoares" | "vulgata" | "douayrheims",
  "book": "genesis",
  "chapter": 1,
  "verses": [
    { "v": 1, "t": "In the beginning God created heaven and earth." },
    { "v": 2, "t": "And the earth was void and empty..." }
  ]
}
```

**Folder structure:**
```
/assets/
  /data/
    /vulgata/<book>/<chapter>.json
    /matossoares/<book>/<chapter>.json
    /douayrheims/<book>/<chapter>.json
```

---

## 🎨 Design and UI
- **Background:** looping video of an **antique wooden table** (asset to be chosen later).  
- **Central book:** closed on load → opens to the table of contents.  
- **Table of contents:** navigable list of books/chapters.  
- **Reading view:** one translation at a time, with arrows to turn pages (animated page-flip, no “drag”).  
- **Footer:**  
  - Left: link to the author’s GitHub.  
  - Right: language selector with flags 🇧🇷 🇻🇦 🇬🇧.  

---

## 🏗️ Project Architecture
- **Frontend:** React (via CDN) or lightweight Web Components.  
- **State:** `{ bookId, chapter, translation, view }`.  
- **Loader:** `fetchJSON(translation, bookId, chapter)`.  
- **Routing:** simple hash → `#/genesis/1?lang=matossoares`.  

---

## ⚖️ Text Licensing
- **Vulgata Clementina (Latin):** public domain.  
- **Douay-Rheims (English):** public domain.  
- **Pe. Matos Soares (Portuguese):** public domain (older editions).  
- No copyrighted modern translations will be included in full.  

---

## 🤝 Contributions
- Suggestions for design, accessibility improvements, and data optimizations are welcome.  
- When adding new chapters, maintain the canonical book names and JSON schema.  

---

📌 **Author:** João Henrique Botelho – [@joaohb07](https://github.com/joaohb07)  
📌 **Deploy:** via GitHub Pages (branch `main`)  
