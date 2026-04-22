"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultPlugin = {
    name: 'raw',
    setup(build) {
        console.log('hello');
    },
};
exports.default = [defaultPlugin];
