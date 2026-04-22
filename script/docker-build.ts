import { version } from '../package.json';
export async function main() {
  let { $ } = await import('execa');
  let tag = version;
  // await $({ stdio: 'inherit' })('docker', [
  //   'build',
  //   '-t',
  //   `ghcr.io/wszgrcy/audio-website:${tag}`,
  //   '-f',
  //   './docker/build/website/Dockerfile',
  //   '.',
  // ]);
  await $({ stdio: 'inherit' })('docker', [
    'build',
    '-t',
    `ghcr.io/wszgrcy/audio-server:${tag}`,
    '-f',
    './docker/build/server/Dockerfile',
    '.',
  ]);
  // await $({ stdio: 'inherit' })('docker', [
  //   'push',
  //   `ghcr.io/wszgrcy/audio-website:${tag}`,
  // ]);
  await $({ stdio: 'inherit' })('docker', [
    'push',
    `ghcr.io/wszgrcy/audio-server:${tag}`,
  ]);
}
main();
