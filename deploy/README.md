# Dithermark

This is the instructions for how to run [Dithermark](https://app.dithermark.com) on your computer with no internet connection.

## Chrome / ChromeOS

* Visit https://app.dithermark.com in Chrome

* Click the three dots button in the upper right

* Select the "Cast, save, and share" menu item, and then "Install page as app..."

## Windows

* If you have an Intel or AMD cpu run `dithermark-x64.exe` in this folder. If you have a Snapdragon or other ARM cpu run `dithermark-arm64.exe` in this folder.

* This will open a terminal, where you may be asked to allow network permissions.

* Open the web browser of your choice to http://localhost:8800

* If there is a problem due to the port being in use, change the port number in `config.json`

## MacOS

* Right click `dithermark.command` and open with TextEdit

* You will see a message about permissions, click ok

* Close the file without saving it

* Double click `dithermark.command`. This should open the Terminal app. If it doesn't, right click `dithermark.command` and open with Terminal.

* Open the web browser of your choice to http://localhost:8800

* If there is a problem due to the port being in use, open `dithemark.command` with TextEdit or the text editor of your choice and change the port number

## Linux / BSD

* Open a terminal to this directory and run `./dithemark.command`

* This requires either Python 3 or PHP. Python 3 is most likely already installed by your distribution, but if not you will need to install it via your package manager

* Open the web browser of your choice to http://localhost:8800

* If there is a problem due to the port being in use, open `dithemark.command` with the text editor of your choice and change the port number