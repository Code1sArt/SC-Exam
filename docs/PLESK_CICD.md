# GitHub Actions → Plesk

Student Panel เป็น Vite static site ซึ่ง build เป็นโฟลเดอร์ `dist/` แล้ว deploy ไปที่:

```text
/var/www/vhosts/labedu.tech/httpdocs
```

Workflow `.github/workflows/ci-cd.yml` จะ build และ lint ทุก Pull Request/Push
เข้า `main` ส่วนขั้น deploy จะทำงานเมื่อ Repository variable
`PLESK_DEPLOY_ENABLED` เป็น `true` เท่านั้น

## 1. ตรวจค่า Hosting ใน Plesk

ที่ **Websites & Domains → labedu.tech → Hosting Settings** ให้ตรวจว่า:

| รายการ | ค่า |
| --- | --- |
| Hosting type | Website hosting |
| Document root | `httpdocs` |
| SSL/TLS support | เปิด |
| Permanent SEO-safe 301 redirect from HTTP to HTTPS | เปิด |

โปรเจกต์นี้เป็น static site จึงไม่ต้องเปิด Node.js ใน Plesk

## 2. อนุญาต SSH deploy key

นำ public key ที่สร้างสำหรับ GitHub Actions ไปเพิ่มให้ผู้ใช้ `admin_lebedu` ใน
Plesk หรือเพิ่มหนึ่งบรรทัดลงใน:

```text
~/.ssh/authorized_keys
```

จากนั้นทดสอบว่า key เขียน Document Root ได้:

```bash
ssh -i ./sc_exam_student_plesk admin_lebedu@118.27.146.122 \
  "test -w /var/www/vhosts/labedu.tech/httpdocs && echo writable"
```

หากเขียนไม่ได้ ให้แก้สิทธิ์/เจ้าของผ่าน Plesk โดยไม่ใช้ `chmod 777`

## 3. GitHub Secrets และ Variables

ที่ **Settings → Secrets and variables → Actions** ต้องมี:

### Secrets

| ชื่อ | ค่า |
| --- | --- |
| `PLESK_SSH_PRIVATE_KEY` | private key ทั้งไฟล์ |
| `PLESK_SSH_KNOWN_HOSTS` | output จาก `ssh-keyscan` หลังตรวจ fingerprint |

Host-key fingerprints ที่ตรวจพบเมื่อ 23 กรกฎาคม 2026:

```text
ED25519 SHA256:zoxACkj4j0iMxJCxrD/41UsKV7+oDkMe1mhI/UoImwY
RSA     SHA256:dS5nSeFo+MdxoOwm6WuNhPC9HnkGvJdJBS9gLZ+OYw0
```

ควรยืนยัน fingerprint กับหน้า Plesk/ผู้ดูแลเซิร์ฟเวอร์ก่อนใช้งานครั้งแรก

### Variables

| ชื่อ | ค่า |
| --- | --- |
| `VITE_API_URL` | `https://api.labedu.tech/api/v1` |
| `PLESK_SSH_PORT` | `22` |
| `PLESK_DEPLOY_ENABLED` | เริ่มด้วย `false` |

## 4. เปิด deploy

เมื่อเพิ่ม public key บน Plesk และทดสอบสิทธิ์เขียนสำเร็จแล้ว:

1. เปลี่ยน `PLESK_DEPLOY_ENABLED` เป็น `true`
2. ไปที่ **Actions → CI/CD to Plesk → Run workflow**
3. ตรวจว่า job `Deploy production` สำเร็จ
4. เปิด `https://labedu.tech` และทดสอบ Login/การเรียก API

การ deploy ใช้ `rsync --delete` เพื่อลบไฟล์ build เก่าที่ไม่ใช้แล้ว แต่จะเก็บ
โฟลเดอร์ `.well-known` ของ Plesk/Let's Encrypt ไว้

## แก้ปัญหา

- `Permission denied (publickey)`: public key ยังไม่อยู่ใน
  `authorized_keys` ของ `admin_lebedu`
- `Host key verification failed`: ค่า `PLESK_SSH_KNOWN_HOSTS` ไม่ตรงกับ
  server; ห้ามปิด StrictHostKeyChecking ให้ยืนยัน fingerprint แล้วอัปเดต secret
- `test -w ... failed`: ผู้ใช้ SSH ไม่มีสิทธิ์เขียน `httpdocs`
- เว็บเปิดได้แต่เรียก API ไม่ได้: ตรวจ `VITE_API_URL`, HTTPS และ CORS ของ API
  แล้ว run workflow ใหม่ เพราะค่า Vite ถูกฝังตอน build
