export function editorConfig(baseUrl) {
    return {
      placeholder: '请输入内容...',
      MENU_CONF: {
        uploadImage: {
          server: baseUrl + 'api/note/upload/',
          fieldName: 'file',
          customInsert(res, insertFn) {
            const url = baseUrl+'note' + res.data.url
            insertFn(url)
          },
          maxFileSize: 25 * 1024 * 1024,
          allowedFileTypes: ['image/*']
        },
  
        uploadVideo: {
          server: baseUrl + 'api/note/upload/',
          fieldName: 'file',
          customInsert(res, insertFn) {
            const url = baseUrl +'note' + res.data.url
            insertFn(url)
          },
          maxFileSize: 250 * 1024 * 1024,
          allowedFileTypes: ['video/*']
        }
      }
    }
  }