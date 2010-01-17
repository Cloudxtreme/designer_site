#!/bin/sed -f
#
# SED script for parsing out include file names from 
# the application.js file.
#

# Remove single line comments first
/^\s+\/\//d

# Remove multi-line comments
/^\s+\/\*.+/d
/\/\*/,/\*\// { 
	s/.*//g 
}

# Replace the require lines with just their contents
s/this\.require\(["']([^"']*)["']\);/\1/

# Remove all lines that don't end in js
# assumes we are getting all of our JS files
/js$/!d

# Remove the spaces before and after the filename
# assumes there are no spaces in the filename iteself
s/\s*//
