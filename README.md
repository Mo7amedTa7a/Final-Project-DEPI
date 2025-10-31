# CureTap Frontend

واجهة مشروع **CureTap** — منصة متكاملة لتنظيم مواعيد الأطباء، الاستشارات الطبية بالفيديو، وطلب الأدوية من الصيدليات في مكان واحد.

---

## Tech Stack
- **React.js** (Create React App)
- **Bootstrap React**
- **Material UI (MUI)**
- **Axios** (للتعامل مع الـ API لاحقًا)
- **React Router DOM**
- **Git & GitHub Workflow**

---

## Git Workflow (Team Rules)

>  مهم جدًا الالتزام بالورك فلو دا علشان نضمن إن الـ main دايمًا مستقر.

### الفروع الأساسية
- **`main`** → الفرع الرئيسي، ممنوع أي شغل مباشر عليه.
- **`staging`** → الفرع التجميعي (نختبر عليه كل الفيتشرز قبل ما ندمج للـ main).

### الخطوات الأساسية لكل عضو:
1. تأكد إنك على آخر نسخة من المشروع:
   ```bash
   git checkout staging
   git pull origin staging

### أنشئ فرع جديد باسم الميزة اللي هتشتغل عليها

git checkout -b feature/اسم-الميزة


### اشتغل على الكود، وبعد الانتهاء 

git add .
git commit -m "Add: وصف التعديل"
git push origin feature/اسم-الميزة


### روح على GitHub → اعمل Pull Request (PR) من feature/... إلى staging.

بعد المراجعة والموافقة، بنعمل Merge للـ staging.

عند انتهاء المشروع بالكامل، نعمل Merge من staging إلى main.

______________________________________________________________
# Team Workflow Example
مثال                    	الفرع  	 الاسم 	
محمد	feature/navbar	             إنشاء Navbar بالـ MUI	
ياسين	feature/login	             صفحة تسجيل الدخول	
عمر	    feature/doctor-profile	     بروفايل الدكتور	

______________________________________________________________
# Project Setup

1. Clone the repo
git clone https://github.com/Mo7amedTa7a/Final-Project-DEPI.git

2. Install dependencies
npm install

3. Run the project
npm run dev



# لاحظ
### كل واحد في الفريق يعمل  

git clone https://github.com/your-username/your-repo-name.git


### وبعدين لما يشتغلوا على برانش خاص بيهم

git checkout -b feature/feature-name


### وبعد ما يخلص 

git push origin feature/feature-name