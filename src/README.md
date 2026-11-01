# GAME ARMN — بنية المشروع

index.html          الهيكل فقط (HTML + بيانات SEO)
css/base.css        تنسيقات الألعاب الأساسية
css/hub.css         تنسيقات الواجهة الرئيسية
css/3d.css          طبقة الـ3D (إمالة، أزرار بارزة، عمق، شعار) — احذفه لترجع الواجهة مسطّحة
js/games.js         الألعاب العشر
js/anime3d.js       مولّد شخصيات الأنمي 3D (متجر الصور: 18–32)
js/accounts.js      الحسابات + Firebase + المتجر
js/boot.js          تهيئة
js/hub.js           الواجهة الرئيسية
js/extras.js        إضافات
js/fx3d.js         إمالة 3D للبطاقات (بدون خلفية متحركة)
js/tutorial.js      تعليمات أول دخول لكل لعبة (مرة واحدة)
بناء index.html: python3 build.py
service-worker.js   كاش أوفلاين (v15)

تعطيل الـ3D من الكونسول: APP3D.toggle(false)
