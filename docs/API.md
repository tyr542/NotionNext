# API 文档

## 概述
本文档描述了项目中的API接口。

## 接口列表

### GET /api/posts
获取文章列表

**参数:**
- page: 页码 (可选)
- limit: 每页数量 (可选)

**响应:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### GET /api/posts/[slug]
获取单篇文章

**参数:**
- slug: 文章标识符

**响应:**
```json
{
  "success": true,
  "data": {...}
}
```
