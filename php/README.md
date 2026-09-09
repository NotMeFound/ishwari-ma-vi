# Ishwari Secondary School - Official Institutional Web Portal (PHP)

This repository contains the complete, pure PHP 8.2+ production package for Ishwari Secondary School (ईश्वरी माध्यमिक विद्यालय).

---

## 🚀 XAMPP Local Deployment Instructions

1. **Extract Files**:
   Extract the archive `ishwari-ma-vi-final.zip` directly into:
   ```
   C:\xampp\htdocs\ishwari\
   ```

2. **Start Apache and MySQL**:
   Open the XAMPP Control Panel and start both **Apache** and **MySQL**.

3. **Import Database**:
   - Open your browser to `http://localhost/phpmyadmin/`
   - Create a database named `ishwari_school` (with utf8mb4_unicode_ci collation).
   - Click **Import** and upload `php/schema.sql`.

4. **Run the Application**:
   Navigate to:
   ```
   http://localhost/ishwari/
   ```

---

## 🔐 Administrative Access
- **Portal Link**: `http://localhost/ishwari/admin.php` or `http://localhost/ishwari/php/admin/login.php`
- **Username**: `admin@ishwari.edu.np`
- **Password**: `admin123`
- *Features*: Publish/delete circular notices, update school metadata and Principal's message, export database.

---

## 🌐 Features
- **Language Switcher (EN ↔ NE)**: Segmented sliding toggle switch with 🇬🇧 and 🇳🇵 national flags.
- **Theme Switcher (Dark ↔ Light)**: Tactile minimalist flat UI toggle switch.
- **Live BS Date & Time**: Real-time Bikram Sambat calendar display (Saturday, Bhadra 20, 2083 / शनिबार, २०८३ भाद्र २०).
- **Public Modules**: Notices, Curriculum (ECD to +2), Laboratory Facilities, Staff Directory, Events, Achievements, History Timeline, Citizen Charter Documents, and Contact Inquiry form with CSRF protection.
