# Edit Article Page - Features & Documentation

## 🎨 Overview
Halaman edit article yang telah dirombak total dengan modern design, best practices, dan UX-friendly features.

## ✨ Key Features

### 1. **Autosave Functionality**
- ✅ Otomatis menyimpan artikel setelah 3 detik tidak ada perubahan
- ✅ Mengurangi risiko kehilangan data
- ✅ Indikator status saving yang jelas

### 2. **Multiple View Modes**
- **Edit Mode**: Fokus penuh pada editor markdown
- **Split Mode**: Editor dan preview berdampingan (default)
- **Preview Mode**: Fokus penuh pada preview hasil

### 3. **Real-time Save Status**
- 🔵 **Saving...**: Sedang menyimpan perubahan
- 🟢 **Saved**: Berhasil disimpan dengan timestamp
- 🔴 **Save failed**: Gagal menyimpan (dengan error handling)
- 🟡 **Unsaved changes**: Ada perubahan yang belum disimpan

### 4. **Keyboard Shortcuts**
- `Cmd/Ctrl + S`: Simpan manual
- `Cmd/Ctrl + Shift + P`: Toggle preview mode

### 5. **Unsaved Changes Protection**
- ⚠️ Warning sebelum meninggalkan halaman jika ada perubahan yang belum disimpan
- 🛡️ Mencegah kehilangan data yang tidak disengaja

### 6. **Modern UI/UX**
- 📱 Fully responsive design
- 🎯 Clean and intuitive interface
- 🌓 Dark mode support
- 🎨 Consistent styling dengan design system

### 7. **Enhanced Markdown Editor**
- 📝 Full markdown syntax support
- 🎨 Syntax highlighting
- 👀 Live preview
- 📏 Auto-expanding textarea
- 🖼️ Support untuk images, tables, code blocks, dll

### 8. **Article Metadata**
- 📂 Section information
- 📅 Last updated timestamp
- 🏷️ Breadcrumb navigation

### 9. **Better User Feedback**
- 🔔 Toast notifications untuk success/error
- 📊 Visual save indicators
- 💡 Helpful tips section
- ⌨️ Keyboard shortcut hints

## 🏗️ Technical Architecture

### Component Structure
```
EditArticle Component
├── Header (Sticky)
│   ├── Back Button + Breadcrumb
│   ├── Save Status Indicator
│   └── View Mode Toggle + Save Button
├── Article Meta Information
├── Title Input Field
├── Content Editor (MDEditor)
│   ├── Edit View
│   ├── Split View
│   └── Preview View
└── Tips Section
```

### State Management
- `title`: Article title
- `content`: Markdown content
- `saveStatus`: Current save state (idle/saving/saved/error)
- `lastSaved`: Timestamp of last successful save
- `hasUnsavedChanges`: Boolean flag untuk track perubahan
- `viewMode`: Current editor view mode

### Key Hooks & Effects
1. **Unsaved Changes Tracking**: Monitors title & content changes
2. **Autosave Timer**: Debounced save after 3 seconds
3. **Navigation Protection**: beforeunload event listener
4. **Keyboard Shortcuts**: Global keydown listener

## 📝 Usage

### Untuk User
1. Navigate ke dashboard
2. Klik icon edit (pencil) pada artikel yang ingin diedit
3. Edit title dan/atau content
4. Perubahan akan auto-save atau tekan Cmd/Ctrl + S
5. Toggle view mode sesuai preferensi
6. Klik "Back" atau breadcrumb untuk kembali ke dashboard

### Untuk Developer
```tsx
// Controller (Laravel/Inertia)
public function editArticle($id)
{
    $page = Page::with(['sidebarItem.sidebarSection'])->findOrFail($id);
    
    return Inertia::render('edit-article', [
        'editingPage' => $page,
        'sidebarSections' => $sidebarSections,
        'projects' => $this->defaultProjects(),
    ]);
}

// Route
Route::get('/article/{id}/edit', [PageController::class, 'editArticle'])
    ->name('article.edit');
```

## 🎨 Styling

Custom CSS telah dibuat di `resources/css/markdown-editor.css` dengan features:
- Custom scrollbar
- Enhanced markdown preview
- Dark mode support
- Responsive adjustments
- Focus states
- Keyboard shortcut badges

## 🔒 Security Features
- CSRF token protection
- Input validation
- XSS prevention via markdown sanitization
- Authorized user only (auth middleware)

## 📱 Responsive Design
- Mobile-friendly layout
- Touch-optimized controls
- Adaptive editor height
- Collapsible toolbar on small screens

## 🚀 Performance Optimizations
- Debounced autosave (mengurangi unnecessary API calls)
- Lazy loading untuk preview
- Optimized re-renders dengan proper useEffect dependencies
- Cleanup functions untuk prevent memory leaks

## 🧪 Best Practices Implemented
1. ✅ TypeScript for type safety
2. ✅ Component-based architecture
3. ✅ Separation of concerns
4. ✅ Error handling & user feedback
5. ✅ Accessibility (ARIA labels, keyboard navigation)
6. ✅ Responsive design
7. ✅ Loading states & skeleton screens
8. ✅ Consistent coding style
9. ✅ Code documentation
10. ✅ RESTful API integration

## 🔧 Dependencies
- `@uiw/react-md-editor`: Markdown editor component
- `@inertiajs/react`: SSR framework
- `justd-icons`: Icon library
- `sonner`: Toast notifications

## 🎯 Future Enhancements (Optional)
- [ ] Version history / revision tracking
- [ ] Collaborative editing
- [ ] Image upload drag & drop
- [ ] AI-powered writing suggestions
- [ ] Export to PDF/HTML
- [ ] Template system
- [ ] Spell checker
- [ ] Word count & reading time
- [ ] Comments & annotations

## 📞 Support
Untuk pertanyaan atau issues, silakan hubungi tim development atau buat issue di repository.

---

**Last Updated**: October 2025  
**Version**: 2.0  
**Author**: BINTANGMFHD Development Team
