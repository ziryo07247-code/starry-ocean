# 📁 프로젝트 구조

```text
├── client
│   ├── client\src
│   │   ├── client\src\api
│   │   │   └── client\src\api\client.js
│   │   ├── client\src\assets
│   │   │   ├── client\src\assets\hero.png
│   │   │   ├── client\src\assets\react.svg
│   │   │   └── client\src\assets\vite.svg
│   │   ├── client\src\components
│   │   │   ├── client\src\components\AddIslandModal.jsx
│   │   │   ├── client\src\components\BottomControls.jsx
│   │   │   ├── client\src\components\ConstellationCanvas.jsx
│   │   │   ├── client\src\components\MapModal.jsx
│   │   │   ├── client\src\components\MemoModal.jsx
│   │   │   ├── client\src\components\MiniMap.jsx
│   │   │   ├── client\src\components\NightSkyBackground.css
│   │   │   ├── client\src\components\NightSkyBackground.jsx
│   │   │   ├── client\src\components\StarField.jsx
│   │   │   └── client\src\components\TitleModal.jsx
│   │   ├── client\src\hooks
│   │   │   ├── client\src\hooks\useConstellation.js
│   │   │   ├── client\src\hooks\useDragScroll.js
│   │   │   ├── client\src\hooks\useIslandsAndMemos.js
│   │   │   └── client\src\hooks\useIslandScrollSync.js
│   │   ├── client\src\utils
│   │   │   └── client\src\utils\starPosition.js
│   │   ├── client\src\App.css
│   │   ├── client\src\App.jsx
│   │   ├── client\src\index.css
│   │   └── client\src\main.jsx
│   ├── client\index.html
│   ├── client\package.json
│   ├── client\package-lock.json
│   └── client\vite.config.js
├── server
│   ├── server\config
│   │   └── server\config\db.js
│   ├── server\controllers
│   │   ├── server\controllers\aiMemoController.js
│   │   ├── server\controllers\islandController.js
│   │   └── server\controllers\memoController.js
│   ├── server\routes
│   │   ├── server\routes\aiMemos.js
│   │   ├── server\routes\islands.js
│   │   └── server\routes\memos.js
│   ├── server\services
│   │   └── server\services\embeddingService.js
│   └── server\server.js
├── .env
├── .env.example
├── .gitignore
├── 1차_ai평가.txt
├── Ai_architecture.md
├── package.json
├── package-lock.json
├── README.md
├── tree.md
└── 무제한 섬 확장_architecture.md
```
