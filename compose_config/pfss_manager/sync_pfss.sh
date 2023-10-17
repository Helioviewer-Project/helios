#!/bin/bash

usage_help() {
	echo "This script is used to sync the latest pfss files from the field line server."
	echo "The script uses rsync to download new files from the field line server."
	echo "See usage below for details"
	echo ""
	usage
	exit 0
}

usage() {
	echo "Usage: $0 [-h] <datapath> <serverpath>"
	echo ""
	echo "datapath   - Folder to store pfss binaries into"
	echo "serverpath - Path to helios/server"
}

sync_pfss() {
	target=$1
	echo "Getting latest pfss files"
	time rsync -e "ssh -o StrictHostKeyChecking=accept-new" --progress --ignore-existing -z -L -r -a -h pfss:~/gong $target
	echo "Done getting pfss files"
}

update_db() {
	server_dir=$1
	data_dir=$2
	echo "Updating pfss database"
	pushd $server_dir
	python -m scripts.pfss.import gong $data_dir
	popd
}

while getopts ":h" o; do
    case "${o}" in
        h)
		usage_help
		;;
    esac
done
shift $((OPTIND-1))

if [ -z "$1" ] || [ -z "$2" ]; then
    usage
    exit 1
fi

target=`readlink -f $1`
serverdir=$2

sed -i "s/{pfss_host}/$(cat /run/secrets/pfss_host)/" ~/.ssh/config
sync_pfss $target
update_db $serverdir $target
