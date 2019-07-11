```sh
hdiutil convert -format UDRW -o ~/Downloads/k3os ~/Downloads/k3os-arm64.iso
mv ~/Downloads/k3os.dmg ~/Downloads/k3os.img
diskutil list
diskutil unmountDisk /dev/disk2
sudo dd if=~/Downloads/k3os.img of=/dev/disk2 bs=1m 
diskutil eject /dev/disk2
```


https://www.lewan.com/blog/2012/02/10/making-a-bootable-usb-stick-on-an-apple-mac-os-x-from-an-iso
