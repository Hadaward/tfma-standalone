# Transformice Adventures Standalone
Transformice Adventures Standalone (TAS) is a program developed in NodeJS in support of the ElectronJS and Request libraries. It allows you to play on the desktop and also temporarily fixes the current problem with the game chat not working.

# Changelog

- The code has been refined and improved again. Now being able to properly check the open ports and limit the amount of windows that can be opened.
- The program will not be able to run in more than 5 windows, if a sixth window is opened a message will appear warning you about it.
- The view and debug settings are appropriately saved.
- Now ProtoM801.js is no longer a local file, it will be loaded from the game's official website and modified before being sent to Standalone, so there is no need to worry when the game is updated as the Standalone will work.

# Compatibility
The program is compatible with Linux and Mac but does not have an installer available, if anyone wants to create feel free to do so.
For windows there is an executable installer available for the x32 and x64 platforms.

# Note
The reason for the ressources folder to continue to exist is because when uploading some graphic resources of the game through the official website it was not correctly received and caused visual bugs, however there is no need to worry if something new is implemented in the game and needs new files because if the file does not exist in the ressources folder it will continue to load from the site.
