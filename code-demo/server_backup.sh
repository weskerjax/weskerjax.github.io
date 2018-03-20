#!/bin/bash
# Program : 備份指定目錄
# History : 2009/03/19 
# Author : Jax
# E-mail : weskerjax@gmail.com
# Website : http://jax-work-archive.blogspot.com/

PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export PATH

# 排除不需要備份的檔案類型
exclude=""
filter=(
  "*.bak"           # 排除副檔名為 .bak 的檔案
  ".*"              # 排除所有隱藏檔
  "/CVS/"           # 排除所有目錄為 CVS 的目錄
  "Smarty/cache"    # 排除路徑為 Smarty/cache 的目錄 
  "Smarty/tpl_c"    # 排除路徑為 Smarty/tpl_c 的目錄
)
for i in "${filter[@]}" ; do
  exclude="$exclude --exclude=$i"
done 

# 時間參數
date=`date +%Y%m%d`

# 配份目錄
targetDir="/home/web"

# 備份檔名路徑目錄
zipFile="/home/backup/backup_$date.tar.bz2"

# 執行壓縮指令
tar -jcf $zipFile $exclude -C $targetDir `ls $targetDir`

exit 0
