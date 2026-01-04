#!/bin/bash

# 数据备份脚本
# 使用方法: ./backup.sh

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="medal_system.db"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 检查数据库文件是否存在
if [ ! -f "$DB_FILE" ]; then
    echo "错误: 数据库文件 $DB_FILE 不存在"
    exit 1
fi

# 执行备份
cp "$DB_FILE" "$BACKUP_DIR/medal_system_$DATE.db"

# 压缩备份（可选）
gzip "$BACKUP_DIR/medal_system_$DATE.db"

echo "✅ 备份完成: $BACKUP_DIR/medal_system_$DATE.db.gz"

# 删除7天前的备份（可选）
find "$BACKUP_DIR" -name "medal_system_*.db.gz" -mtime +7 -delete
echo "✅ 已清理7天前的备份文件"

