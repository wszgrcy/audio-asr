#!/bin/sh

STATUS_DIR=".status"
INITED_FILE="$STATUS_DIR/.inited"
echo "开始..."

if node init.mjs; then
    echo "init.mjs 执行成功。"
    
else
    echo "ERROR: init.mjs 执行失败！退出。" >&2
    exit 1
fi


echo "启动主程序..."
node main.mjs