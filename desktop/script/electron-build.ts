import * as builder from 'electron-builder';
import { Configuration } from 'electron-builder';
import path from 'node:path';
const Platform = builder.Platform;

// Let's get that intellisense working
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration
 */
const options: Configuration = {
  // protocols: {
  //   name: 'Deeplink Example',
  //   // Don't forget to set `MimeType: "x-scheme-handler/deeplink"` for `linux.desktop` entry!
  //   schemes: ['deeplink'],
  // },

  // "store” | “normal” | "maximum". - For testing builds, use 'store' to reduce build time significantly.
  compression: 'normal',
  removePackageScripts: true,
  // 是强制包含判断
  onNodeModuleFile: (file) => {
    // return !/\.(md|cpp|c|h|ts|gpy|hpp)$|^LICENSE$/.test(file);
    return false;
  },
  // afterSign: async (context) => {
  //   // Mac releases require hardening+notarization: https://developer.apple.com/documentation/xcode/notarizing_macos_software_before_distribution
  //   // if (!isDebug && context.electronPlatformName === 'darwin') {
  //   //   await notarizeMac(context);
  //   // }
  // },
  // artifactBuildStarted: (context) => {
  //   // identifyLinuxPackage(context);
  // },

  // beforeBuild: async (context) => {
  //   const { appDir, electronVersion, arch } = context;
  //   let result = await rebuild({ buildPath: appDir, electronVersion, arch });
  //   return false;
  // },
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,
  // 开发用
  asar: false,
  electronLanguages: ['en-US', 'zh-CN', 'zh-TW'],
  directories: {
    output: 'output',
    buildResources: 'installer/resources',
    app: './',
  },
  files: [
    '!**/*.{cpp,c,gypi,md,txt,hpp,cpp,h,sh,gyp,patch,map,ts}',
    '!**/LICENSE',
    '!**/license',
    '!**/LICENSE.*',
  ],
  // extraFiles: [
  //   {
  //     from: './',
  //     to: './resources/app/config',
  //   },
  // ],

  win: {
    target: ['nsis', 'zip'],
    icon: 'webview/assets/icon/favicon.ico',
  },
  nsis: {
    deleteAppDataOnUninstall: true,
    useZip: true,
    // include: 'installer/win/nsis-installer.nsh',
  },

  mac: {
    target: 'dmg',
    hardenedRuntime: true,
    gatekeeperAssess: true,
    extendInfo: {
      NSAppleEventsUsageDescription: 'Let me use Apple Events.',
      NSCameraUsageDescription: 'Let me use the camera.',
      NSScreenCaptureDescription: 'Let me take screenshots.',
    },
  },
  dmg: {
    background: 'installer/mac/dmg-background.png',
    iconSize: 100,
    contents: [
      {
        x: 255,
        y: 85,
        type: 'file',
      },
      {
        x: 253,
        y: 325,
        type: 'link',
        path: '/Applications',
      },
    ],
    window: {
      width: 500,
      height: 500,
    },
  },

  linux: {
    desktop: {
      //   StartupNotify: 'false',
      //   Encoding: 'UTF-8',
      //   MimeType: 'x-scheme-handler/deeplink',
    },
    target: ['AppImage', 'rpm', 'deb', 'pacman'],
  },
  deb: {
    priority: 'optional',
    afterInstall: 'installer/linux/after-install.tpl',
  },
  rpm: {
    fpm: ['--before-install', 'installer/linux/before-install.tpl'],
    afterInstall: 'installer/linux/after-install.tpl',
  },
};

// Promise is returned
builder
  .build({
    targets: Platform.WINDOWS.createTarget(),
    config: options,
    projectDir: path.join(process.cwd(), 'dist'),
  })
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    console.error(error);
  });
