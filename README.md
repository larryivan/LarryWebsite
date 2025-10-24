# larrywebsite

## Project setup
```
pnpm install
```

### Compiles and hot-reloads for development
```
pnpm run serve
```

### Compiles and minifies for production
```
pnpm run build
```

### Lints and fixes files
```
pnpm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Notion Blog Content

The Blog列表和详情页直接从 Notion 数据库读取内容，并在站内渲染。默认通过 `https://notion-api.splitbee.io` 代理访问。

在启动项目（或构建）前，请在项目根目录新建 `.env.local` 并配置：

- `VUE_APP_NOTION_BLOG_DATABASE_ID` – required; the Notion database ID that backs the blog posts.
- `VUE_APP_NOTION_API_BASE_URL` – optional; override the proxy base URL if you host your own Notion API proxy.
- `VUE_APP_NOTION_POST_BASE_URL` – optional; base URL for building post links (uses the Notion page URL when omitted).
- `Name` (标题) – 默认列，必填
- `Summary` 或 `Description` – 简要摘要，用于列表页展示
- `Date` (Date 类型) – 文章日期，会显示在列表和详情页
- `Slug` – 选填。用于生成 `/blog/:slug` 的站内链接；不填时会自动以标题或 Notion 页面 ID 生成
- `Cover` (Files & media) – 选填。列表卡片和详情页头图
- `Tags` (Multi-select) – 选填。会显示标签
- `Published` (Checkbox) – 未勾选的条目不会在网站显示

在 Notion 中开启数据库的公开分享（Share → Share to web），并复制数据库链接获取 ID（链接末尾 32 位字符串）。

访问 `/blog` 可看到 Notion 中所有已发布文章的列表，点击卡片即可进入 `/blog/:slug` 详情页，正文内容由 Notion 页面块渲染而成。
