import fs from 'node:fs';
import path from 'node:path';

const localTmp = path.resolve(process.cwd(), '.tmp');
if (!fs.existsSync(localTmp)) {
  fs.mkdirSync(localTmp, { recursive: true });
}
process.env.TEMP = localTmp;
process.env.TMP = localTmp;



