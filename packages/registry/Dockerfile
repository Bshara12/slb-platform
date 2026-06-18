# المرحلة الأولى: Builder
# نستخدم Alpine لأنه خفيف (5MB) مقارنة بـ Ubuntu (72MB)
FROM node:20-alpine AS builder

# مجلد العمل داخل الـ container
WORKDIR /app

# نُنسخ ملفات الـ package أولاً قبل الكود
# لماذا؟ Docker يُخزّن كل سطر كـ layer
# إذا لم يتغير هذا الملف، لا يُعيد تنصيب الـ packages
# هذا يُسرّع الـ build كثيراً
COPY package*.json ./
COPY tsconfig*.json ./

# نُنسخ الـ shared types
COPY ../../shared ./shared

# تنصيب الـ dependencies
RUN npm ci --only=production=false

# الآن ننسخ الكود
COPY src ./src

# نُترجم TypeScript → JavaScript
RUN npm run build

# ============================================================
# المرحلة الثانية: Production image
# نبدأ من صفر ونأخذ فقط ما نحتاجه
# هذا يُصغّر الـ image النهائي ويُقلّل surface area للأمان
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# نأخذ فقط الكود المُترجَم من المرحلة الأولى
COPY --from=builder /app/dist ./dist

# متغير البيئة الافتراضي
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/server.js"]