#! /bin/sh

case $1 in
	refresh | reload)
/usr/bin/osascript > /dev/null << __ASCPT__
	tell application "Google Chrome Canary"
		repeat with theWindow in every window
			set active tab index of theWindow to 1
			reload the active tab of theWindow
		end repeat
	end tell
__ASCPT__
		;;
	*)
		echo "Usage: chrome.sh reload"
esac
