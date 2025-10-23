import * as fs from 'fs';
import * as path from 'path';

export function ensureDirectoriesExist() {
  const directories = [
    path.resolve(__dirname, '../../generated/audios'),
    path.resolve(__dirname, '../../generated/uploads'),
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    }
  });
}