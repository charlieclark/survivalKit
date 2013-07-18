#!/bin/sh

#brew install lftp (takes a while to install dependencies)

ftp_site="sftp://starwood.domanistudios.com"
username="starwood"
remote="/httpdocs/STW-13-751"
from_dir="public"

# lftp -c 'open -e "set ftp:passive-mode false; set ftp:list-options -a; mirror -a --parallel=1 --reverse -v  '$from_dir'/ .'$remote'" -u '$username' '$ftp_site''





