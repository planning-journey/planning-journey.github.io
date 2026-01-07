# GitHub Pages 배포 가이드 (GitHub 기본 도메인)

이 가이드는 프로젝트를 `${username}.github.io` 또는 `${username}.github.io/${repoName}` 형식의 GitHub 기본 제공 도메인에 배포하는 방법을 설명합니다.

## 1. Vite 설정 (`base` 경로 설정)

GitHub Pages 배포 시 가장 중요한 설정은 프로젝트가 호스팅되는 경로(URL)를 Vite에 알리는 것입니다.

### CASE A: 사용자/조직 페이지 (루트 도메인)
- **URL**: `https://${username}.github.io/`
- **저장소 이름**: 반드시 `${username}.github.io`여야 함.
- **설정**: `base: '/'`

`vite.config.ts`를 다음과 같이 수정합니다:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  // 사용자 페이지(username.github.io)라면 '/'로 설정
  base: '/', 
})
```

## 2. GitHub Actions 워크플로우 설정

저장소에 푸시하면 자동으로 빌드 및 배포되도록 `.github/workflows/deploy.yml` 파일을 생성합니다.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ "master" ] # 기본 브랜치 이름 확인 (master 또는 main)

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

## 3. GitHub 저장소 설정 (중요)

1. GitHub 저장소의 **Settings > Pages** 메뉴로 이동합니다.
2. **Build and deployment > Source** 항목에서 `Deploy from a branch`가 아닌 **`GitHub Actions`**를 선택합니다.
3. 코드를 `master` 브랜치에 푸시하면 **Actions** 탭에서 배포 진행 상황을 확인할 수 있습니다.

## 4. SPA 라우팅 대응

GitHub Pages는 기본적으로 Single Page Application(SPA)의 클라이언트 라우팅을 지원하지 않습니다. 이를 해결하기 위해 본 프로젝트에는 다음과 같은 처리가 이미 적용되어 있습니다:

1.  `public/404.html`: 잘못된 경로로 접근 시 쿼리 스트링을 이용해 `index.html`로 리다이렉트합니다.
2.  `index.html`: 리다이렉트된 쿼리 스트링을 읽어 원래의 경로로 브라우저 히스토리를 복구합니다.

따라서 추후에 `react-router-dom` 등을 추가하더라도 별도의 설정 없이 새로고침 및 직접 링크 접근이 가능합니다.