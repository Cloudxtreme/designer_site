#!/bin/bash
#
# ExxonMobil Designer Site Build Script
# by Mike Crute, EYEMG (mcrute@eyemg.com)
#
# This is a pretty simple build script just export a
# tag or the trunk from SVN and run ./make, running
# make (w/out the ./) will not work. You can then 
# take the generated tarball and explode it on the 
# production server w/out any further configuration.
#

cd docroot

# Create the build directory and copy over the cgi-bin
mkdir -p build/{docroot,cgi-bin}
mkdir build/docroot/lib
cp -R ../cgi-bin/* build/cgi-bin/

# Create a build date file
echo "Designer Site Built `date +'%Y-%m-%d %H:%M:%S'` EST" > build/docroot/build.date
echo "Code Version: `grep 'releaseVersion' classes/sme.namespace.js | cut -d"'" -f 2 `" >> build/docroot/build.date
echo "Subversion Revision: `svn info | grep 'Revision' | awk '{ print $2 }'`" >> build/docroot/build.date

# Remove stuff from the cgi-bin that does not belong in
# production.
rm build/cgi-bin/*.sql

# Also copy over any files that don't need special processing
cp -R images           \
      blank.gif        \
      favicon.ico      \
      custom_content   \
build/docroot/

cp -R lib/scriptaculous build/docroot/lib/

# Prepare the .htaccess file for production
#
# We use a sparse layout in development where each class is
# in its own separate file but in production we use a solid
# layout that is also gzipped so we have to un-comment the 
# gzip headers in our htaccess file.

#sed '
#	/### PRODUCTION ###/,/### END PRODUCTION ###/ {
#		/^###.*/d
#		s/#//g
#	}
#' .htaccess > build/docroot/.htaccess

cp .htaccess build/docroot/.htaccess

# Minify the PNG Behavior
sed '
	/\/\*/,/\*\// {
		/.*/d;
	}
' pngbehavior.htc > build/docroot/pngbehavior.htc

# Concatenate the Javascript files into a single library file
#
# application.js loads all the javascript files in the development
# environment. When we go to production we need to parse out the
# actual script names being loaded and cat them, in order, into
# the final output application.js file.

# GNU sed uses the -r flag for extended regular expressions,
# Darwin uses the -E flag for regular expressions. If neither
# of these hold true we might as well fail.
if [[ `uname` == 'Linux' ]]; then
	MYFILES=`sed -r -f ../build_system/get_jsfiles.sed  application.js`
elif [[ `uname` == 'Darwin' ]]; then
	MYFILES=`sed -E -f ../build_system/get_jsfiles.sed application.js`
else
	print 'No valid sed command could be determined.'
	exit 1
fi

for item in $MYFILES; do
	cat $item >> build/docroot/application.js.in
done

# Remove development code from the application code
# and append it to the libraries files
sed '/^;;;.*/d' build/docroot/application.js.in >> build/docroot/application.js.out
sed '/^\/\*;;;.*/d' build/docroot/application.js.out >> build/docroot/application.js
rm build/docroot/application.js.in build/docroot/application.js.out

# Minify index.html by removing leading spaces on each line
# as well as the ID comment, blank lines, and any script tags
# that appear in the <head> of the document.
sed 's/^[[:space:]]*//; /^$/d; s/\n$//; /<!--/,/-->/ { /.*/d; }' index.html > build/docroot/index.html
sed 's/^[[:space:]]*//; /^$/d; s/\n$//; /<!--/,/-->/ { /.*/d; }' logged_out.html > build/docroot/logged_out.html

# Minify the application Javascript using the YUI Compressor
java -jar ../build_system/yui_compressor.jar -o application.o build/docroot/application.js > /dev/null 2>&1
mv application.o build/docroot/application.js

# Minify the JSON data files
mkdir -p build/docroot/data
for item in `ls data/`; do
	java -jar ../build_system/yui_compressor.jar -o build/docroot/data/$item data/$item > /dev/null 2>&1
done

# Can't minimize JSON, the semicolon at the end breaks everything
cat data/card_tables.js > build/docroot/data/card_tables.js

# Minify the application CSS using our custom compressor
../build_system/cmpcss application.css > build/docroot/application.css
../build_system/cmpcss specialcases.css > build/docroot/specialcases.css

# Gzip all that should be gzipped. This really should be done server-side
# but for now we work around it by statically compressing them at build time
# and serving it with the correct headers in the .htaccess file
#gzip build/docroot/application.js
#gzip build/docroot/application.css
#gzip build/docroot/index.html
#
#mv build/docroot/application.js.gz build/docroot/application.js
#mv build/docroot/application.css.gz build/docroot/application.css
#mv build/docroot/index.html.gz build/docroot/index.html

# Tar it all up in a development dump
mv build aes_designer
cd aes_designer

# Removing the date since its really not needed
tar -cjvf ../../aes_designer.tbz2 * > /dev/null 2>&1
#tar -cjvf ../../aes_designer-`date +%Y%m%d_%H%M%S`.tbz2 * > /dev/null 2>&1


cd ..

rm -rf aes_designer/
