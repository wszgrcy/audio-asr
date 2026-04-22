import path from 'path';
import { DefaultConfigDir } from '../const';
import type { GlobalConfigType } from '../define/global-config';
import Store from 'electron-store';

type ConfigType = GlobalConfigType;

const STORE_NAME = 'global-config';
const store = new Store();
export class GlobalConfigService {
  get() {
    const data = store.get(STORE_NAME) as ConfigType | undefined;
    return { ...data, ...(data?.platform as any)?.[process.platform] };
  }
  set(config: ConfigType) {
    store.set(STORE_NAME, config);
  }
  remove() {
    store.delete(STORE_NAME);
  }
  async getFFmpegPath() {
    const config = await this.get()!;
    return path.join(
      path.resolve(DefaultConfigDir, config.ffmpeg!.dir),
      config.ffmpeg!.execPath,
    );
  }
  async getFFprobePath() {
    const config = await this.get()!;
    return path.join(
      path.resolve(DefaultConfigDir, config.ffmpeg!.dir),
      config.ffmpeg!.execPath.replace('ffmpeg.exe', 'ffprobe.exe'),
    );
  }
}
