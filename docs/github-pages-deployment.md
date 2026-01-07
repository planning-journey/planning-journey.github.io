# GitHub Pages 배포 가이드 (커스텀 서브 도메인)

이 가이드는 Vite로 제작된 본 프로젝트를 GitHub Actions를 통해 GitHub Pages에 배포하고, 커스텀 서브 도메인(예: `planning.yourdomain.com`)을 연결하는 방법을 설명합니다.

## 1. Vite 설정 수정

서브 도메인의 루트(`/`)에서 서비스할 경우 `base` 설정이 중요합니다.

`vite.config.ts` 파일을 다음과 같이 수정합니다:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/', // 서브 도메인을 사용할 경우 '/'로 설정
  // ... 기존 설정
})
```

## 2. CNAME 파일 생성

배포 시 도메인 설정을 유지하기 위해 `public` 디렉터리에 `CNAME` 파일을 생성해야 합니다.

1. `public/CNAME` 파일을 만듭니다.
2. 파일 내용에 사용할 서브 도메인만 입력합니다. (예: `planning.example.com`)

## 3. GitHub Actions 워크플로우 설정

`.github/workflows/deploy.yml` 파일을 생성하여 자동 배포를 설정합니다.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ "master" ] # 또는 본인의 기본 브랜치 이름

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 4. GitHub 저장소 설정

1. GitHub 저장소의 **Settings > Pages** 메뉴로 이동합니다.
2. **Build and deployment > Source**를 `GitHub Actions`로 변경합니다.
3. **Custom domain** 섹션에 서브 도메인(`planning.example.com`)을 입력하고 Save를 누릅니다. (이미 CNAME 파일을 만들었다면 자동으로 채워질 수 있습니다.)

## 5. DNS 설정 (도메인 구입처)

본인의 도메인 관리 페이지(가비아, Cloudflare, GoDaddy 등)에서 다음과 같이 DNS 레코드를 추가합니다.

| 타입 | 이름 (Host) | 값 (Value/Points to) |
| :--- | :--- | :--- |
| **CNAME** | `planning` | `your-github-username.github.io.` |

- **주의**: 값 끝에 점(`.`)이 필요한 경우가 있으니 관리 도구의 안내를 확인하세요.
- DNS 전파에는 수 분에서 최대 24시간이 소요될 수 있습니다.

## 6. SPA 라우팅 대응 (선택 사항)

만약 나중에 `react-router-dom` 등을 사용하여 Browser Routing을 추가한다면, GitHub Pages에서 발생하는 404 오류를 방지하기 위해 `public/404.html` 트릭을 사용해야 합니다. 현재는 단일 페이지 기반이므로 필수 사항은 아닙니다.
