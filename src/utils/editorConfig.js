export function createEditorConfig(baseUrl) {
    return {
      placeholder: '请输入内容...',
      MENU_CONF: {
        uploadImage: {
          server: baseUrl + '/api/upload/image',
          fieldName: 'file',
          maxFileSize: 5 * 1024 * 1024,
          allowedFileTypes: ['image/*']
        },
  
        uploadVideo: {
          server: baseUrl + '/api/upload/video',
          fieldName: 'file',
          maxFileSize: 50 * 1024 * 1024,
          allowedFileTypes: ['video/*']
        }
      }
    }
  }