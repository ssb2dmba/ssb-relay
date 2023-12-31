#!/bin/bash
set -e

ELECTRUM_NMC_VERSION="4.0.0b1"

# the branch or tag to build
branch="$1"

# the absolute path of this executable on the system
node_deb_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

#
# functions
#
install_relay_from_source() {
  mkdir -p "$node_deb_dir/sysroot/usr/local/"
  cd "$node_deb_dir/sysroot/usr/local/"
  git clone https://github.com/ssb2dmba/ssb-relay --branch "$branch"
  cd ./ssb-relay
  rm -fr .git
  npm install
  npm run build
  chmod -R 755 "$node_deb_dir/sysroot/usr/local/ssb-relay"
}

install_electrum_nmc() {
  mkdir -p "$node_deb_dir/sysroot/usr/local/"
  cd "$node_deb_dir/sysroot/usr/local/"
  wget https://www.namecoin.org/files/electrum-nmc/electrum-nmc-4.0.0b1/Electrum-NMC-${ELECTRUM_NMC_VERSION}.tar.xz
  tar -xJf Electrum-NMC-${ELECTRUM_NMC_VERSION}.tar.xz
  mv Electrum-NMC-${ELECTRUM_NMC_VERSION} Electrum-NMC
  rm Electrum-NMC-${ELECTRUM_NMC_VERSION}.tar.xz
  chmod -R 755 "$node_deb_dir/sysroot/usr/local/Electrum-NMC"
}


escape() {
  sed -e 's/[]\/$*.^|[]/\\&/g' -e 's/&/\\&/g' <<< "$@"
}

install_templates() {
  cd $node_deb_dir
  mkdir -p sysroot/DEBIAN
  cp "$node_deb_dir/templates/postinst" "$node_deb_dir/sysroot/DEBIAN/"
  cp "$node_deb_dir/templates/prerm" "$node_deb_dir/sysroot/DEBIAN/"
  cp "$node_deb_dir/templates/postrm" "$node_deb_dir/sysroot/DEBIAN/"
  cp "$node_deb_dir/templates/copyright" "$node_deb_dir/sysroot/DEBIAN/"
}


template_control() {
   sed < "$node_deb_dir/templates/control" \
      -e "s/{{ package_name }}/$(escape "$package_name")/g" \
      -e "s/{{ app_version }}/$(escape "$app_version")/g" \
      -e "s/{{ package_description }}/$(escape "$package_description")/g" \
      -e "s/{{ author }}/$(escape "$author")/g" \
      -e "s/{{ homepage }}/$(escape "$homepage")/g" \
    > "$node_deb_dir/sysroot/DEBIAN/control"
    chmod "0644" "$node_deb_dir/sysroot/DEBIAN/control"
}


fix_control_perms() {
  chmod "0755" "$node_deb_dir/sysroot/DEBIAN/postinst"
  chmod "0755" "$node_deb_dir/sysroot/DEBIAN/prerm"
  chmod "0755" "$node_deb_dir/sysroot/DEBIAN/postrm"
  chmod "0755" "$node_deb_dir/sysroot/DEBIAN/copyright"
  chmod "0755" "$node_deb_dir/sysroot/DEBIAN/md5sums"
}


build_md5() {
  find "$node_deb_dir/sysroot/" -type "f" -not -path "$node_deb_dir/sysroot/DEBIAN/*" -print0 | xargs -0 md5sum >>  "$node_deb_dir/sysroot/DEBIAN/md5sums"
  sed -i "s|$node_deb_dir/sysroot||g" "$node_deb_dir/sysroot/DEBIAN/md5sums"
}

clean_build_dir() {
  rm -fr "$node_deb_dir/sysroot"
}

#
# Main
#
if [[ -z $branch ]];
then
    echo " - Usage: ./$0  [branch or tag] . "
    exit 1
fi


clean_build_dir
install_relay_from_source

packagejson="$node_deb_dir/sysroot/usr/local/ssb-relay/package.json"
app_version=$(jq -r '.version' "$packagejson")
package_name=$(jq -r '.name' "$packagejson")
package_description=$(jq -r '.description' "$packagejson")
author=$(jq -r '.author' "$packagejson")
homepage=$(jq -r '.homepage' "$packagejson")

install_templates
template_control
install_electrum_nmc
build_md5
fix_control_perms

archive="${package_name}_${app_version}_arm64.deb"
fakeroot dpkg-deb -Zxz --build "$node_deb_dir/sysroot" "$node_deb_dir/$archive"

# cleanup
# clean_build_dir
