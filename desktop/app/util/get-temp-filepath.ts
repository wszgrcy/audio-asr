import { tmpdir } from 'os';
import path from 'path';
import { v4 } from 'uuid';

export function getTempFilePath() {
  return path.join(tmpdir(), v4());
}
