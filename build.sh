# Exit if any command fails
set -e
dist_dir=dist

# Clean any existing build
rm -rf $dist_dir
mkdir $dist_dir

# Pack up javascript
npx webpack
# make docs
npm run docs

# Copy dist files to dist folder
cp helios_bundle.js $dist_dir
cp index.html $dist_dir
cp -r docs $dist_dir
cp -r resources $dist_dir

