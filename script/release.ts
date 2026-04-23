import { execSync } from 'child_process';
import { version } from '../package.json';
function main() {
  const tagName = `${version}`;
  execSync(`git tag -a "${tagName}" -m "Release version ${version}"`, {
    stdio: 'inherit',
  });

  execSync(`git push origin "${tagName}"`, {
    stdio: 'inherit',
  });
}
main();