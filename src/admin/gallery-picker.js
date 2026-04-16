// ═══ DACEWAV Admin — Gallery Picker Upload ═══
// Handles file upload in the gallery picker modal

function initGalleryPickerUpload() {
  const pickerUpload = document.getElementById('gallery-picker-upload');
  if (!pickerUpload) return;

  pickerUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;

      // If R2 is available, upload properly
      if (typeof window.uploadToR2 === 'function' && typeof window._r2IsEnabled === 'function' && window._r2IsEnabled()) {
        window.uploadToR2(file, 'gallery/' + Date.now() + '-' + file.name).then(result => {
          if (typeof window.saveUrlToGallery === 'function') {
            window.saveUrlToGallery(result.url, file.name.replace(/\.[^.]+$/, ''), 'other', []);
          }
          if (window.__pickGalleryImg) window.__pickGalleryImg(result.url);
        }).catch(err => {
          alert('Error uploading: ' + err.message);
        });
      } else {
        // Fallback: use data URL and pick directly
        if (window.__pickGalleryImg) window.__pickGalleryImg(url);
      }
      pickerUpload.value = '';
    };
    reader.readAsDataURL(file);
  });
}

initGalleryPickerUpload();
