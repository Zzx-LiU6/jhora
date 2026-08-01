# 🔮 JHora 星盘文本清洗工具

一个专门处理 Jagannatha Hora（JHora）软件导出星盘文本的纯前端工具。自动清洗冗余数据，输出 AI 友好的标准化文本。

在线地址: https://jhora-clean.pages.dev

## 主要功能

- **四个独立粘贴框**：
  1. 完整全盘计算文本（提取出生信息 + D1 星体列表）
  2. 单分盘经度星体文本（支持 D1/D9/D10… 多次粘贴自动累加）
  3. Vimsottari 大运/小运（Dasas 菜单逐层复制，自动合并去重）
  4. 当前过运（Gochara/Transit）（Transit 菜单复制，用于精确时间窗口判断）
- 智能筛选：极简AI模式 / 深度专业模式 / 自定义勾选
- 自动清洗：去除虚点、辅助Lagna、Sphuta、Arudha、网格表格
- 大运合并：自动去重，按 MD/AD/Pratyantardasa 层级展示
- 一键导出：复制成品 / 导出 TXT / 跳转 AI 平台
- 本地历史记录：自动保存最近 20 次清洗结果
- 专业话术生成器：根据勾选维度生成占星解读提示词

## 技术栈

- Vanilla JavaScript（纯原生，零依赖）
- CSS3（暗色主题）
- Cloudflare Pages（部署托管）

## 本地运行

这是一个纯静态 HTML 项目，无需安装任何依赖。克隆后直接用浏览器打开 `index.html` 即可。

## 使用流程

1. 从 JHora 复制数据，粘贴到对应的四个输入框
2. 点击「清洗本段」或直接「合并生成」
3. 复制标准化星盘文本
4. 配合 [JHora AI 提问助手](https://jhora-prompt.pages.dev) 生成专属提问话术

## 项目结构
```text
/
├── index.html  # 页面结构
├── style.css   # 样式
└── app.js      # 完整逻辑
`---`

## License

MIT
