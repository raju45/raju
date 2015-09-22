#!/bin/bash
DIR1=/home/admin/XY/homeController
DIR2=/home/admin/XY/gitScripts
DIR3=/home/admin/XY/gitScripts/shellScripts/upgradeScripts
REPO=https://github.com/xyio/xy.git
BRANCH=dev

mkdir /home/admin/XY
mkdir /home/admin/XY/homeController
mkdir /home/admin/XY/logs
mkdir /home/admin/XY/configs

git clone -b $BRANCH $REPO $DIR1
cp $DIR1/package.json $DIR1/../package.json

git init $DIR2
git --work-tree=$DIR2 --git-dir=$DIR2/.git remote add -f origin $REPO
git --git-dir=$DIR2/.git config core.sparsecheckout true
echo "shellScripts" >> $DIR2/.git/info/sparse-checkout
git --work-tree=$DIR2 --git-dir=$DIR2/.git pull origin $BRANCH

echo "------------------ git clone XY done ----------------";

wget http://nodejs.org/dist/v0.10.25/node-v0.10.25-linux-arm-pi.tar.gz
tar -xvzf node-v0.10.25-linux-arm-pi.tar.gz
mv -if node-v0.10.25-linux-arm-pi /opt/node
rm node-v0.10.25-linux-arm-pi.tar.gz

sudo ln -s /opt/node/bin/node /usr/bin/node
sudo ln -s /opt/node/bin/npm /usr/bin/npm

echo "------------------ nodejs and npm installation done ----------------";

npm install /home/admin/XY/
mv -if node_modules/XY/node_modules/ XY/node_modules
rm -r node_modules

echo "------------------ XY node package installation done ----------------";


sudo cp /home/admin/XY/homeController/shellScripts/XY.sh /etc/init.d/XY
sudo chmod 755 /etc/init.d/XY
sudo update-rc.d XY defaults

echo "------------------ added XY.sh to startup scripts ----------------";

sudo cp /home/admin/XY/homeController/shellScripts/checkIpAlias.sh /etc/init.d/checkIpAlias.sh
sudo chmod 755 /etc/init.d/checkIpAlias.sh
sudo update-rc.d checkIpAlias.sh defaults

sudo chmod 755 /home/admin/XY/homeController/shellScripts/checkIpAlias.sh
line="* * * * * sudo /home/admin/XY/homeController/shellScripts/checkIpAlias.sh > /home/admin/XY/logs/checkIpAlias.log"
(crontab -u root -l; echo "$line" ) | crontab -u root -

echo "------------------ checkIpAlias added to cron ----------------";

sudo chmod 755 /home/admin/XY/homeController/shellScripts/wifiCheck.sh
line="* * * * * sudo /home/admin/XY/homeController/shellScripts/wificheck.sh > /home/admin/XY/logs/wificheck.log"
(crontab -u root -l; echo "$line" ) | crontab -u root -

echo "------------------ checkWifi added to cron ----------------";
