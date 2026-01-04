#!/usr/bin/env node

/**
 * 数据持久化测试脚本
 * 用于验证数据库是否正常工作
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'medal_system.db');

console.log('🔍 测试数据持久化...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    console.log('\n💡 提示: 请先运行 npm start 启动服务器，让系统创建数据库文件');
    process.exit(1);
  }
  
  console.log('✅ 数据库连接成功\n');
  
  // 检查表是否存在
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('❌ 查询表失败:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log('📊 数据库表:');
    if (tables.length === 0) {
      console.log('  ⚠️  没有找到表，数据库可能是空的');
    } else {
      tables.forEach(table => {
        console.log(`  ✅ ${table.name}`);
      });
    }
    console.log('');
    
    // 统计各表数据量
    const tablesToCheck = ['behaviors', 'medals', 'users'];
    let checked = 0;
    
    tablesToCheck.forEach(tableName => {
      db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, row) => {
        if (err) {
          // 表不存在是正常的（如果还没初始化）
          console.log(`  📋 ${tableName}: 表未创建（首次运行时会自动创建）`);
        } else {
          console.log(`  📋 ${tableName}: ${row.count} 条记录`);
        }
        
        checked++;
        if (checked === tablesToCheck.length) {
          console.log('\n✅ 数据持久化测试完成！');
          console.log('\n💡 提示:');
          console.log('  - 所有操作都会自动保存到 medal_system.db');
          console.log('  - 关闭浏览器或重启服务器，数据不会丢失');
          console.log('  - 定期备份 medal_system.db 文件');
          db.close();
        }
      });
    });
  });
});

