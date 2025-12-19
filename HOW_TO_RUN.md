# 🚀 AnuCode - How to Run & Build

---

## 📱 **Option 1: See Current Running App (Development Mode)**

### **Desktop App** (Recommended to see now!)
```
URL: http://localhost:5173
```

**Open karo browser mein:**
1. Open Chrome/Edge
2. Go to: `http://localhost:5173`
3. You'll see AnuCode editor interface!

**Features visible:**
- ✅ Title bar with AnuCode logo
- ✅ Menu (File, Edit, View, etc.)
- ✅ Resizable panels
- ✅ Monaco code editor
- ✅ AI panel (right side)
- ✅ Terminal panel (bottom)
- ✅ Status bar

---

## 💿 **Option 2: Build Windows Installer (.exe)**

### **Step 1: Copy Missing Components**

First, copy all components from `ANUCODE_COMPLETE_IMPLEMENTATION.md`:

```bash
# Create these files in apps/desktop/src/components/
StatusBar.tsx
ActivityBar.tsx
Sidebar.tsx
EditorArea.tsx
AIPanel.tsx
BottomPanel.tsx
```

### **Step 2: Build Production App**

```bash
cd apps/desktop

# Build renderer (React app)
npm run build:renderer

# Build electron (main process)
npm run build:electron

# Create installer
npm run package
```

### **Step 3: Find Your Installer**

After build completes:
```
Location: apps/desktop/out/AnuCode-Setup-0.1.0.exe
Size: ~150-200 MB
```

---

## 📦 **Installer Features**

Your installer will have:
- ✅ Welcome screen
- ✅ License agreement (EULA)
- ✅ Installation directory selection
- ✅ Desktop shortcut creation
- ✅ Start menu shortcut
- ✅ Progress bar
- ✅ Finish screen
- ✅ Auto-launch option

---

## 🎯 **Quick Preview (Current Running App)**

### **Right Now - Open This:**

**Browser:** http://localhost:5173

You'll see:
```
┌─────────────────────────────────────────────────────┐
│ AnuCode - File Edit View Go Run Terminal Help  [X] │
├──┬────────────────────────────┬──────────────────┤
│  │ MONACO EDITOR              │  AI PANEL        │
│A │ (Code here)                │  Chat with AI    │
│C │                            │                  │
│T │                            │                  │
│I │                            │                  │
│V │                            │                  │
│I │                            │                  │
│T │                            │                  │
│Y │                            │                  │
├──┴────────────────────────────┴──────────────────┤
│ Terminal │ Output │ Problems                     │
├──────────────────────────────────────────────────┤
│ main* │ TypeScript │ UTF-8 │ Ln 1, Col 1        │
└──────────────────────────────────────────────────┘
```

---

## 🔧 **Troubleshooting**

### **If localhost:5173 not working:**

```bash
# Restart dev server
npm run dev
```

### **If components missing:**

1. Open `ANUCODE_COMPLETE_IMPLEMENTATION.md`
2. Copy all 6 component codes
3. Paste in `apps/desktop/src/components/`

### **If build fails:**

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

---

## 🎨 **Installer Customization**

To customize installer:

**Edit:** `apps/desktop/package.json`

```json
"nsis": {
  "installerIcon": "path/to/icon.ico",
  "installerHeader": "path/to/header.bmp",
  "installerSidebar": "path/to/sidebar.bmp"
}
```

---

## 📸 **Screenshots**

### **Installer Screens:**

1. **Welcome Screen**
   ```
   Welcome to AnuCode Setup
   This will install AnuCode on your computer.
   [Next] [Cancel]
   ```

2. **License Agreement**
   ```
   Please read the license agreement...
   [I accept] [Cancel]
   ```

3. **Installation Directory**
   ```
   Choose install location
   C:\Program Files\AnuCode
   [Browse] [Next] [Back]
   ```

4. **Installing**
   ```
   Installing AnuCode...
   [Progress bar: 45%]
   ```

5. **Finish**
   ```
   AnuCode has been installed!
   [x] Launch AnuCode
   [Finish]
   ```

---

## 🚀 **Recommended Steps**

### **NOW (5 minutes):**
1. Open http://localhost:5173 in browser
2. See the UI
3. Test resizable panels
4. Test AI chat (if backend running)

### **LATER (30 minutes):**
1. Copy missing components
2. Build installer
3. Test installation
4. Share with users!

---

## 📊 **Build Output**

After running `npm run package`:

```
apps/desktop/out/
├── AnuCode-Setup-0.1.0.exe     ← Windows Installer
├── win-unpacked/               ← Unpacked files
│   └── AnuCode.exe             ← Direct executable
└── builder-effective-config.yaml
```

**Users can:**
- Run installer → Setup wizard → Install → Launch
- Or directly run: `win-unpacked/AnuCode.exe`

---

## 💡 **Pro Tips**

1. **Icon Quality:** Convert PNG to .ico for better installer icons
   ```bash
   # Online tool: convertio.co/png-ico
   # Or use ImageMagick
   ```

2. **Code Signing:** For production, sign the installer
   ```json
   "win": {
     "certificateFile": "cert.pfx",
     "certificatePassword": "password"
   }
   ```

3. **Auto Updates:** Add electron-updater
   ```bash
   npm install electron-updater
   ```

---

## ✅ **Quick Commands**

```bash
# See current app
# Just open: http://localhost:5173

# Build installer
cd apps/desktop
npm run build
npm run package

# Clean build
npm run clean && npm run build && npm run package
```

---

**Choose your path:**
- **Quick Preview:** Open localhost:5173 NOW!
- **Full Build:** Follow Step 2 above

**Kya dekhna hai pehle? Current running app ya installer banayein?** 🚀
