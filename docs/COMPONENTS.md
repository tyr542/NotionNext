# 组件文档

## 概述
本文档描述了项目中的React组件。

## 组件列表

### LazyImage
懒加载图片组件

**Props:**
- src: 图片地址 (必需)
- alt: 图片描述 (必需)
- width: 图片宽度 (可选)
- height: 图片高度 (可选)
- priority: 是否优先加载 (可选)

**用法:**
```jsx
<LazyImage 
  src="/image.jpg" 
  alt="描述" 
  width={300} 
  height={200} 
/>
```

### SEO
SEO优化组件

**Props:**
- title: 页面标题 (可选)
- description: 页面描述 (可选)
- keywords: 关键词 (可选)

**用法:**
```jsx
<SEO 
  title="页面标题" 
  description="页面描述" 
  keywords="关键词1,关键词2" 
/>
```
