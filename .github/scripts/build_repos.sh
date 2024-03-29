#!/bin/bash
generate_hashes() {
  HASH_TYPE="$1"
  HASH_COMMAND="$2"
  echo "${HASH_TYPE}:"
  find "${COMPONENTS:-main}" -type f | while read -r file
  do
    echo " $(${HASH_COMMAND} "$file" | cut -d" " -f1) $(wc -c "$file")"
  done
}

main() {
  GOT_DEB=0
  DEB_POOL="_site/deb/pool/${COMPONENTS:-main}"
  DEB_DISTS="dists/${SUITE:-stable}"
  DEB_DISTS_COMPONENTS="${DEB_DISTS}/${COMPONENTS:-main}/binary-all"
  GPG_TTY=""
  export GPG_TTY
  mkdir -p _site/deb/pool/main
  while IFS= read -r repo
  do
    echo "Parsing the repo list https://api.github.com/repos/${repo}/releases/latest"  
    if release=$(curl -fqs https://api.github.com/repos/${repo}/releases/latest)
    then
      tag="$(echo "$release" | jq -r '.tag_name')"
      deb_file="$(echo "$release" | jq -r '.assets[] | select(.name | endswith(".deb")) | .name')"
      echo "Parsing repo $repo at $tag"
      if [ -n "$deb_file" ]
      then
        GOT_DEB=1

        pushd "$DEB_POOL" >/dev/null
        echo `pwd`
        echo "Getting DEB https://github.com/${repo}/releases/download/${tag}/${deb_file} ..."
        wget -q "https://github.com/${repo}/releases/download/${tag}/${deb_file}"
        echo "done"
        popd >/dev/null
      fi
    fi

  done < .github/config/package_list.txt
#  mkdir -p $DEB_POOL
#  mkdir -p "$DEB_DISTS_COMPONENTS"
  cp deb-install/*.deb $DEB_POOL
  GOT_DEB=1
  if [ $GOT_DEB -eq 1 ]
  then
    pushd _site/deb >/dev/null
    mkdir -p "${DEB_DISTS_COMPONENTS}"
    echo "Scanning all downloaded DEB Packages and creating Packages file."
    dpkg-scanpackages  pool/ > "${DEB_DISTS_COMPONENTS}/Packages"
    gzip -9 > "${DEB_DISTS_COMPONENTS}/Packages.gz" < "${DEB_DISTS_COMPONENTS}/Packages"
    bzip2 -9 > "${DEB_DISTS_COMPONENTS}/Packages.bz2" < "${DEB_DISTS_COMPONENTS}/Packages"
    popd >/dev/null
    pushd "_site/deb/${DEB_DISTS}" >/dev/null
    echo "Making Release file"
    {
      echo "Origin: ${ORIGIN}"
      echo "Label: ${REPO_OWNER}"
      echo "Suite: ${SUITE:-stable}"
      echo "Codename: ${SUITE:-stable}"
      echo "Version: 1.0"
      echo "Architectures: all"
      echo "Components: ${COMPONENTS:-main}"
      echo "Description: ${DESCRIPTION:-A repository for packages released by ${REPO_OWNER}}"
      echo "Date: $(date -Ru)"
      generate_hashes MD5Sum md5sum
      generate_hashes SHA1 sha1sum
      generate_hashes SHA256 sha256sum
    } > Release
    echo "Signing Release file"
    gpg --detach-sign --armor --sign > Release.gpg < Release
    gpg --detach-sign --armor --sign --clearsign > InRelease < Release
    echo "$DEB_POOL DEB repo built"
    popd >/dev/null
  fi
}
main